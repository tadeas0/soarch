from abc import ABC, abstractmethod
from asyncio import Future
from typing import Iterable
import logging
from app.util.song import Song
import config


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
    async def get_all_songs(self) -> Iterable[Future[Song]]:
        pass

    @abstractmethod
    async def insert(self, song: Song) -> None:
        pass

    @abstractmethod
    async def insert_many(self, songs: Iterable[Song]) -> None:
        pass
