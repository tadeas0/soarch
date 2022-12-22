import asyncio
from typing import Any, Iterable, Optional
import logging
import config
from google.cloud import storage
from gcloud.aio.storage import storage as aio_storage
from redis import asyncio as aioredis
import io
import json
from app.util.filestorage import FileStorage


logger = logging.getLogger(config.DEFAULT_LOGGER)


class GoogleCloudFileStorage(FileStorage):
    def __init__(
        self,
        credentials_json: dict,
        bucket_name: str,
        redis_url: Optional[str] = None,
    ) -> None:
        self.__creds = credentials_json
        self.__redis_url = redis_url
        self.__bucket_name = bucket_name
        self.__storage_client = None

    def initialize(self) -> None:
        logger.debug("Google cloud file storage initialized")

    def list_all(self) -> list[str]:
        logger.debug("Listing files")
        storage_client = self.get_storage_client()
        return list(
            map(lambda a: a.name, storage_client.list_blobs(self.__bucket_name))
        )

    def get_storage_client(self):
        if not self.__storage_client:
            self.__storage_client = storage.Client.from_service_account_info(
                self.__creds
            )
        return self.__storage_client

    def get_async_client(self):
        logger.debug("Getting client")
        return aio_storage.Storage(service_file=io.StringIO(json.dumps(self.__creds)))

    def get_redis_cache(self):
        logger.debug("Getting redis cache")
        if not self.__redis_url:
            raise RuntimeError("Redis cache url is None")
        return aioredis.from_url(self.__redis_url)

    def list_prefix(self, prefix: str) -> list[str]:
        logger.debug(f"Listing files with prefix {prefix}")
        storage_client = self.get_storage_client()
        return list(
            map(
                lambda a: a.name,
                storage_client.list_blobs(self.__bucket_name, prefix=prefix),
            )
        )

    async def read(
        self,
        key: str,
        redis_cache: Optional[aioredis.Redis] = None,
        async_client: Optional[aio_storage.Storage] = None,
    ) -> bytes:
        handled_redis_cache = False
        if self.__redis_url and not redis_cache and not async_client:
            redis_cache = self.get_redis_cache()
            handled_redis_cache = True
        if redis_cache and (res := await redis_cache.get(key)):
            if handled_redis_cache:
                await redis_cache.close()
            return res
        if async_client:
            down = await async_client.download(self.__bucket_name, key, timeout=90)
        else:
            async with self.get_async_client() as ac:
                down = await ac.download(self.__bucket_name, key, timeout=90)
        if redis_cache:
            await redis_cache.set(key, down)
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
        if self.__redis_url:
            async with self.get_redis_cache() as redis_cache:
                await redis_cache.set(key, content)
                logger.debug(await redis_cache.get(key))
        async with self.get_async_client() as async_client:
            await async_client.upload(self.__bucket_name, key, content, timeout=90)

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
