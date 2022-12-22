import logging
from typing import Iterable
import config
import aiofiles
import os
import asyncio
from app.util.filestorage import FileStorage


logger = logging.getLogger(config.DEFAULT_LOGGER)


class LocalFileStorage(FileStorage):
    def __init__(self, root_path) -> None:
        self.root_path = root_path

    def initialize(self) -> None:
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

    async def write(self, key: str, content: bytes) -> None:
        path = os.path.join(self.root_path, key)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        async with aiofiles.open(path, "wb") as f:
            await f.write(content)

    async def __read_tuple(self, key: str) -> tuple[str, bytes]:
        path = os.path.join(self.root_path, key)
        async with aiofiles.open(path, "rb") as f:
            return (key, await f.read())

    async def read_all_prefix(self, prefix: str) -> Iterable[tuple[str, bytes]]:
        keys = self.list_prefix(prefix)
        return await asyncio.gather(*[self.__read_tuple(i) for i in keys])

    async def read_all_keys(self, keys: list[str]) -> Iterable[tuple[str, bytes]]:
        return await asyncio.gather(*[self.__read_tuple(i) for i in keys])
