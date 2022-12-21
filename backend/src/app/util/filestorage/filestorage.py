from abc import ABC, abstractmethod
from asyncio import Future
from typing import Any, Iterator


class FileStorage(ABC):
    @abstractmethod
    def initialize(self) -> None:
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

    @abstractmethod
    def read_all_prefix(self, prefix: str) -> Iterator[Future[bytes]]:
        pass

    @abstractmethod
    def read_all_keys(self, keys: list[str]) -> Future[list[bytes]]:
        pass
