from abc import ABC, abstractmethod
from typing import Any, Coroutine, Dict, List, IO, Optional, Union
import logging
import config
from google.cloud import storage
from gcloud.aio.storage import storage as aio_storage
import aiofiles
import redis
import io
import json
import asyncio
import os

logger = logging.getLogger(config.DEFAULT_LOGGER)


class FileStorage(ABC):
    @abstractmethod
    def open(self, key: str, mode: str) -> IO:
        pass

    @abstractmethod
    def list(self) -> List[str]:
        pass

    @abstractmethod
    def list_prefix(self, prefix: str) -> List[str]:
        pass

    @abstractmethod
    async def read(self, key: str) -> Any:
        pass

    @abstractmethod
    async def write(self, key: str, content: Any) -> Any:
        pass


class LocalFileStorage(FileStorage):
    def __init__(self, root_path) -> None:
        self.root_path = root_path

    def open(self, key: str, mode: str) -> IO:
        logger.debug(f"Opening local file: {key} mode: {mode}")
        path = os.path.join(self.root_path, key)
        if mode in ("w", "wb"):
            os.makedirs(os.path.dirname(path), exist_ok=True)

        return open(path, mode)

    def list(self) -> List[str]:
        res: List[str] = []
        rd_len = len(self.root_path)
        for path, subdirs, files in os.walk(self.root_path):
            for name in files:
                fp = os.path.join(path[rd_len:], name)
                if fp.startswith("/"):
                    fp = fp[1:]
                res.append(fp)
        return res

    def list_prefix(self, prefix: str) -> List[str]:
        res: List[str] = []
        rd_len = len(self.root_path)
        for path, subdirs, files in os.walk(self.root_path):
            for name in files:
                fp = os.path.join(path[rd_len:], name)
                if fp.startswith("/"):
                    fp = fp[1:]
                if fp.startswith(prefix):
                    res.append(fp)

        return res

    async def read(self, key: str) -> Any:
        path = os.path.join(self.root_path, key)
        async with aiofiles.open(path, "rb") as f:
            return await f.read()

    async def write(self, key: str, content: str) -> Any:
        path = os.path.join(self.root_path, key)
        async with aiofiles.open(path, "w") as f:
            return await f.write(content)


class GoogleCloudFileStorage(FileStorage):
    def __init__(
        self,
        credentials_json: dict,
        bucket_name: str,
        redis_url: str = None,
    ) -> None:
        self.__redis_cache: Optional[redis.Redis] = None
        if redis_url:
            self.__redis_cache = redis.from_url(redis_url)
        self.__storage_client = storage.Client.from_service_account_info(
            credentials_json
        )
        self.__bucket_name = bucket_name
        self.__bucket = self.__storage_client.bucket(bucket_name)
        self.__async_client = aio_storage.Storage(
            service_file=io.StringIO(json.dumps(credentials_json))
        )

    def open(self, key: str, mode: str) -> IO:
        logger.debug(f"Opening cloud file: {key} mode: {mode}")
        if self.__redis_cache:
            logger.debug(f"Opening from cache file: {key} mode: {mode}")
            return self.__open_cache(key, mode)
        else:
            return self.__open_no_cache(key, mode)

    def __open_no_cache(self, key: str, mode: str) -> IO:
        blob = self.__bucket.get_blob(key)
        if blob is None and mode not in ["w", "wb"]:
            raise FileNotFoundError()
        elif mode in ["w", "wb"]:
            return self.__bucket.blob(key).open(mode)
        elif mode == "rb":
            return io.BytesIO(blob.download_as_bytes())
        elif mode == "r":
            return io.TextIOWrapper(blob.download_as_text())
        else:
            raise ValueError(f"invalid mode: {mode}")

    def __open_cache(self, key: str, mode: str) -> IO:
        if self.__redis_cache:
            if mode in ["r", "rb"]:
                res = self.__redis_cache.get(key)
                if res and mode == "r":
                    return io.TextIOWrapper(io.BytesIO(res))
                elif res and mode == "rb":
                    return io.BytesIO(res)
                elif not res and mode == "r":
                    blob = self.__bucket.get_blob(key)
                    if not blob:
                        raise FileNotFoundError()
                    content = blob.download_as_string()
                    self.__redis_cache.set(key, content)
                    return io.TextIOWrapper(io.BytesIO(content))
                elif not res and mode == "rb":
                    blob = self.__bucket.get_blob(key)
                    if not blob:
                        raise FileNotFoundError()
                    content = blob.download_as_bytes()
                    self.__redis_cache.set(key, content)
                    return io.BytesIO(content)
            elif mode in ["w", "wb"]:
                self.__redis_cache.delete(key)
                return self.__bucket.blob(key).open(mode)
            raise ValueError(f"invalid mode: {mode}")
        else:
            raise ValueError("redis cache not defined")

    def list(self) -> List[str]:
        return list(
            map(lambda a: a.name, self.__storage_client.list_blobs(self.__bucket_name))
        )

    def list_prefix(self, prefix: str) -> List[str]:
        return list(
            map(
                lambda a: a.name,
                self.__storage_client.list_blobs(self.__bucket_name, prefix=prefix),
            )
        )

    async def read(self, key: str) -> Any:
        return await self.__async_client.download(self.__bucket_name, key)

    async def write(self, key: str, content: Any) -> Any:
        return await self.__async_client.upload(self.__bucket_name, key, content)
