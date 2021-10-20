from abc import ABC, abstractmethod
from typing import List, IO
from glob import glob
import os


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


class LocalFileStorage(FileStorage):
    def __init__(self, root_path) -> None:
        self.root_path = root_path

    def open(self, key: str, mode: str) -> IO:
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
