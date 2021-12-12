from abc import ABC, abstractmethod
from typing import Any, Optional
import logging
import config
from google.cloud import storage
from gcloud.aio.storage import storage as aio_storage
import aiofiles
import redis
import io
import json
import os

logger = logging.getLogger(config.DEFAULT_LOGGER)


class FileStorage(ABC):
    @abstractmethod
    async def initialize(self) -> None:
        pass

    @abstractmethod
    def list_all(self) -> list[str]:
        pass

    @abstractmethod
    def list_prefix(self, prefix: str) -> list[str]:
        pass

    @abstractmethod
    async def read(self, key: str) -> bytes:
        pass

    @abstractmethod
    async def write(self, key: str, content: Any) -> None:
        pass


class LocalFileStorage(FileStorage):
    def __init__(self, root_path) -> None:
        self.root_path = root_path

    async def initialize(self) -> None:
        os.makedirs(self.root_path, exist_ok=True)
        logger.debug(
            "Local file storage initialized root_path: "
            + f"{os.path.realpath(self.root_path)}"
        )

    def list_all(self) -> list[str]:
        res: list[str] = []
        rd_len = len(self.root_path)
        for path, subdirs, files in os.walk(self.root_path):
            for name in files:
                fp = os.path.join(path[rd_len:], name)
                if fp.startswith("/"):
                    fp = fp[1:]
                res.append(fp)
        return res

    def list_prefix(self, prefix: str) -> list[str]:
        res: list[str] = []
        rd_len = len(self.root_path)
        for path, subdirs, files in os.walk(self.root_path):
            for name in files:
                fp = os.path.join(path[rd_len:], name)
                if fp.startswith("/"):
                    fp = fp[1:]
                if fp.startswith(prefix):
                    res.append(fp)

        return res

    async def read(self, key: str) -> bytes:
        path = os.path.join(self.root_path, key)
        async with aiofiles.open(path, "rb") as f:
            return await f.read()

    async def write(self, key: str, content: str) -> None:
        path = os.path.join(self.root_path, key)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        async with aiofiles.open(path, "wb") as f:
            await f.write(content)


class GoogleCloudFileStorage(FileStorage):
    def __init__(
        self,
        credentials_json: dict,
        bucket_name: str,
        redis_url: str = None,
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
