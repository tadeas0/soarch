import asyncio
from typing import Any, Iterable, Optional
import logging
import common.config as config
from google.cloud import storage
from gcloud.aio.storage import storage as aio_storage
from redis import asyncio as aioredis
import redis
import io
import json
import os
from common.util.filestorage import FileStorage


logger = logging.getLogger(config.DEFAULT_LOGGER)


class GoogleCloudFileStorage(FileStorage):
    def __init__(
        self,
        credentials_json: dict,
        bucket_name: str,
        redis_url: Optional[str] = None,
        prefix: Optional[str] = None,
    ) -> None:
        self.__creds = credentials_json
        self.__redis_url = redis_url
        self.__bucket_name = bucket_name
        self.__prefix = prefix

    def __prep_key(self, key: str) -> str:
        if self.__prefix:
            return os.path.join(self.__prefix, key.strip("/"))
        return key

    def initialize(self) -> None:
        logger.debug("Google cloud file storage initialized")

    def list_all(self) -> list[str]:
        logger.debug("Listing files")
        storage_client = self.get_storage_client()
        pref = len(self.__prefix) if self.__prefix else 0
        return list(
            map(
                lambda a: a.name[pref:],
                storage_client.list_blobs(self.__bucket_name, prefix=self.__prefix),
            )
        )

    def get_storage_client(self):
        return storage.Client.from_service_account_info(self.__creds)

    def get_async_client(self):
        logger.debug("Getting client")
        return aio_storage.Storage(service_file=io.StringIO(json.dumps(self.__creds)))

    def get_redis_cache(self):
        logger.debug("Getting redis cache")
        if not self.__redis_url:
            raise RuntimeError("Redis cache url is None")
        return aioredis.from_url(self.__redis_url)

    def get_sync_redis_cache(self):
        logger.debug("Getting sync redis cache")
        if not self.__redis_url:
            raise RuntimeError("Redis cache url is None")
        return redis.from_url(self.__redis_url)

    def list_prefix(self, prefix: str) -> list[str]:
        logger.debug(f"Listing files with prefix {prefix}")
        storage_client = self.get_storage_client()
        prep_prefix = self.__prep_key(prefix)
        pref = len(self.__prefix) if self.__prefix else 0
        return list(
            map(
                lambda a: a.name[pref:],
                storage_client.list_blobs(self.__bucket_name, prefix=prep_prefix),
            )
        )

    async def read(
        self,
        key: str,
        redis_cache: Optional[aioredis.Redis] = None,
        async_client: Optional[aio_storage.Storage] = None,
    ) -> bytes:
        handled_redis_cache = False
        prep_key = self.__prep_key(key)
        if self.__redis_url and not redis_cache and not async_client:
            redis_cache = self.get_redis_cache()
            handled_redis_cache = True
        if redis_cache and (res := await redis_cache.get(prep_key)):
            if handled_redis_cache:
                await redis_cache.close()
            return res
        if async_client:
            down = await async_client.download(self.__bucket_name, prep_key, timeout=90)
        else:
            async with self.get_async_client() as ac:
                down = await ac.download(self.__bucket_name, prep_key, timeout=90)
        if redis_cache:
            await redis_cache.set(prep_key, down)
        if handled_redis_cache and redis_cache:
            await redis_cache.close()
        return down

    async def __read_tuple(
        self,
        key: str,
        redis_cache: Optional[aioredis.Redis] = None,
        async_client: Optional[aio_storage.Storage] = None,
    ) -> tuple[str, bytes]:
        return (key, await self.read(key, redis_cache, async_client))

    async def write(self, key: str, content: Any) -> None:
        logger.debug(f"Writing key: {key}")
        prep_key = self.__prep_key(key)
        if self.__redis_url:
            async with self.get_redis_cache() as redis_cache:
                await redis_cache.set(prep_key, content)
                logger.debug(await redis_cache.get(prep_key))
        async with self.get_async_client() as async_client:
            await async_client.upload(self.__bucket_name, prep_key, content, timeout=90)

    async def read_all_keys(self, keys: list[str]) -> Iterable[tuple[str, bytes]]:
        if self.__redis_url:
            async with (
                self.get_async_client() as async_client,
                self.get_redis_cache() as redis_cache,
            ):
                return await asyncio.gather(
                    *[self.__read_tuple(i, redis_cache, async_client) for i in keys]
                )
        else:
            async with self.get_async_client() as async_client:
                return await asyncio.gather(
                    *[self.__read_tuple(i, None, async_client) for i in keys]
                )

    async def read_all_prefix(self, prefix: str) -> Iterable[tuple[str, bytes]]:
        keys = self.list_prefix(prefix)
        if self.__redis_url:
            async with (
                self.get_async_client() as async_client,
                self.get_redis_cache() as redis_cache,
            ):
                return await asyncio.gather(
                    *[self.__read_tuple(i, redis_cache, async_client) for i in keys]
                )
        else:
            async with self.get_async_client() as async_client:
                return await asyncio.gather(
                    *[self.__read_tuple(i, None, async_client) for i in keys]
                )

    def read_sync(self, key: str) -> bytes:
        redis_cache = None
        prep_key = self.__prep_key(key)
        if self.__redis_url and not redis_cache:
            redis_cache = self.get_sync_redis_cache()
        if redis_cache and (res := redis_cache.get(prep_key)):
            redis_cache.close()
            return res
        else:
            client = self.get_storage_client()
            down = client.bucket(self.__bucket_name).blob(prep_key).download_as_bytes()
            client.close()
        if redis_cache:
            redis_cache.set(prep_key, down)
            redis_cache.close()
        return down
