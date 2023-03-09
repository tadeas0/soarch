from typing import Any, Iterable
from common.util.filestorage.filestorage import FileStorage


class MockFileStorage(FileStorage):
    data: dict[str, Any] = {}

    def initialize(self) -> None:
        pass

    def list_all(self) -> list[str]:
        return list(self.data.keys())

    def list_prefix(self, prefix: str) -> list[str]:
        return list(i for i in self.data.keys() if i.startswith(prefix))

    async def read(self, key: str) -> bytes:
        return self.data[key]

    async def write(self, key: str, content: Any) -> None:
        self.data[key] = content

    async def read_all_prefix(self, prefix: str) -> Iterable[tuple[str, bytes]]:
        keys = [i for i in self.data.keys() if i.startswith(prefix)]
        return [(i, self.data[i]) for i in keys]

    async def read_all_keys(self, keys: list[str]) -> Iterable[tuple[str, bytes]]:
        return [(i, self.data[i]) for i in keys]

    def read_sync(self, key: str) -> bytes:
        return self.data[key]
