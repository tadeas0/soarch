import logging
from typing import AsyncIterable, Iterable
from common.repository.song_repository import SongRepository
from common.entity.song import Song
from common.util.mongo_serializer import MongoSerializer
import common.config as config
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient

logger = logging.getLogger(config.DEFAULT_LOGGER)


class MongoSongRepository(SongRepository):
    def __init__(self, mongo_url: str) -> None:
        self.mongo_url = mongo_url
        super().__init__()

    def __get_client(self):
        logger.debug("Getting mongo client")
        return AsyncIOMotorClient(self.mongo_url)[config.SONGS_DB][
            config.SONGS_COLLECTION
        ]

    def __get_sync_client(self):
        return MongoClient(self.mongo_url)[config.SONGS_DB][config.SONGS_COLLECTION]

    async def insert(self, song: Song) -> None:
        await self.__get_client().insert_one(MongoSerializer.serialize_song(song))

    async def insert_many(self, songs: Iterable[Song]) -> None:
        await self.__get_client().insert_many(
            (MongoSerializer.serialize_song(i) for i in songs)
        )

    async def list_keys(self) -> list[str]:
        client = self.__get_client()
        return [i["_id"] async for i in client.find({}, {"_id": 1})]

    async def load_song_async(self, file_path: str) -> Song:
        logger.debug(await self.__get_client().server_info())
        client = self.__get_client()
        return MongoSerializer.deserialize_song(
            await client.find_one({"_id": file_path})
        )

    async def get_all_songs(self) -> AsyncIterable[Song]:
        client = self.__get_client()
        async for i in client.find({}):
            yield MongoSerializer.deserialize_song(i)

    def load_song(self, key: str) -> Song:
        client = self.__get_sync_client()
        res = client.find_one({"_id": key})
        if not res:
            raise ValueError("Unknown key")
        return MongoSerializer.deserialize_song(res)

    async def get_song_slugs(self) -> list[str]:
        client = self.__get_client()
        res = client.aggregate(
            [
                {
                    "$project": {
                        "song_slug": {
                            "$concat": ["$metadata.artist", " - ", "$metadata.name"]
                        }
                    }
                }
            ]
        )
        song_slugs = [i["song_slug"] async for i in res]
        return song_slugs
