from typing import Any, Optional
import logging
import config
from google.cloud import storage
from gcloud.aio.storage import storage as aio_storage
import redis
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
        self.__redis_cache: Optional[redis.Redis] = None
        self.__storage_client: Optional[storage.Client] = None
        self.__async_client: Optional[aio_storage.Storage] = None

    async def initialize(self) -> None:
        if self.__redis_url:
            self.__redis_cache = redis.from_url(self.__redis_url)
        self.__storage_client = storage.Client.from_service_account_info(self.__creds)
        self.__bucket = self.__storage_client.bucket(self.__bucket_name)
        self.__async_client = aio_storage.Storage(
            service_file=io.StringIO(json.dumps(self.__creds))
        )
        logger.debug("Google cloud file storage initialized")

    def list_all(self) -> list[str]:
        logger.debug("Listing files")
        if not self.__storage_client:
            raise RuntimeError("Storage client uninitialized")
        return list(
            map(lambda a: a.name, self.__storage_client.list_blobs(self.__bucket_name))
        )

    def list_prefix(self, prefix: str) -> list[str]:
        logger.debug(f"Listing files with prefix {prefix}")
        if not self.__storage_client:
            raise RuntimeError("Storage client uninitialized")
        return list(
            map(
                lambda a: a.name,
                self.__storage_client.list_blobs(self.__bucket_name, prefix=prefix),
            )
        )

    async def read(self, key: str) -> bytes:
        if not self.__async_client:
            raise RuntimeError("Async storage client uninitialized")
        logger.debug(f"Reading key: {key}")
        if self.__redis_cache and (res := self.__redis_cache.get(key)):
            logger.debug(f"Reading from cache key: {key}")
            return res
        down = await self.__async_client.download(self.__bucket_name, key, timeout=90)
        if self.__redis_cache:
            self.__redis_cache.set(key, down)
        return down

    async def write(self, key: str, content: Any) -> None:
        if not self.__async_client:
            raise RuntimeError("Async storage client uninitialized")
        logger.debug(f"Writing key: {key}")
        if self.__redis_cache:
            self.__redis_cache.set(key, content)
        await self.__async_client.upload(self.__bucket_name, key, content, timeout=90)
