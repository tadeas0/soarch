from abc import ABC, abstractmethod
from typing import Any


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
