from abc import ABC, abstractmethod
from typing import List, IO
from google.cloud import storage
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


class GoogleCloudFileStorage(FileStorage):
    def __init__(self, credentials_json: dict, bucket_name: str) -> None:
        self.__storage_client = storage.Client.from_service_account_info(
            credentials_json
        )
        self.__bucket_name = bucket_name
        self.__bucket = self.__storage_client.bucket(bucket_name)

    def open(self, key: str, mode: str) -> IO:
        blob = self.__bucket.get_blob(key)
        if blob is None and mode not in ["w", "wb"]:
            raise FileNotFoundError()

        if blob is None:
            return self.__bucket.blob(key).open(mode)

        return blob.open(mode)

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
