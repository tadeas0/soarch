from abc import ABC, abstractmethod
from typing import Any, Iterable


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
    async def read_all_prefix(self, prefix: str) -> Iterable[tuple[str, bytes]]:
        pass

    @abstractmethod
    async def read_all_keys(self, keys: list[str]) -> Iterable[tuple[str, bytes]]:
        pass

    @abstractmethod
    def read_sync(self, key: str) -> bytes:
        pass
