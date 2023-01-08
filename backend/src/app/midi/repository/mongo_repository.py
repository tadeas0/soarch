from asyncio import Future
import logging
from typing import Iterable
from app.midi.repository.repository import SongRepository
from app.util.song import Song
from app.util.mongo_serializer import MongoSerializer
import config
from motor.motor_asyncio import AsyncIOMotorClient

logger = logging.getLogger(config.DEFAULT_LOGGER)


class MongoRepository(SongRepository):
    def __init__(self, mongo_url: str) -> None:
        self.mongo_url = mongo_url
        super().__init__()

    def __get_client(self):
        logger.debug("Getting mongo client")
        return AsyncIOMotorClient(self.mongo_url)[config.SONGS_DB][
            config.SONGS_COLLECTION
        ]

    def load_directory(self, directory: str) -> None:
        pass

    async def list_keys(self) -> list[str]:
        client = self.__get_client()
        return [i["_id"] async for i in client.find({}, {"_id": 1})]

    async def load_song_async(self, file_path: str) -> Song:
        logger.debug(await self.__get_client().server_info())
        client = self.__get_client()
        return MongoSerializer.deserialize(await client.find_one({"_id": file_path}))

    async def get_all_songs(self) -> Iterable[Future[Song]]:
        client = self.__get_client()
        f = []
        async for i in client.find({}):
            fut = Future()
            fut.set_result(MongoSerializer.deserialize(i))
            f.append(fut)

        return f
