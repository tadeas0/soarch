from abc import ABC, abstractmethod
from typing import AsyncIterable, Iterable
import logging
from common.entity.song import Song
import common.config as config


logger = logging.getLogger(config.DEFAULT_LOGGER)


class SongRepository(ABC):
    def __init__(self) -> None:
        pass

    @abstractmethod
    async def list_keys(self) -> list[str]:
        pass

    @abstractmethod
    async def load_song_async(self, file_path: str) -> Song:
        pass

    @abstractmethod
    def get_all_songs(self) -> AsyncIterable[Song]:
        pass

    @abstractmethod
    async def insert(self, song: Song) -> None:
        pass

    @abstractmethod
    async def insert_many(self, songs: Iterable[Song]) -> None:
        pass

    @abstractmethod
    def load_song(self, key: str) -> Song:
        pass

    @abstractmethod
    async def get_song_slugs(self) -> list[str]:
        pass
