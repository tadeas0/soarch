import asyncio
import io
from typing import AsyncIterable, Iterable
from app.util.filestorage import FileStorage
from app.util.parser import MidiParser
from miditoolkit.midi import MidiFile
import pickle
import logging
from app.entity.song import Song
from app.repository.song_repository import SongRepository
import config
from app.util.helpers import get_artist_name_from_filepath, get_filename_from_metadata


logger = logging.getLogger(config.DEFAULT_LOGGER)


class FileSongRepository(SongRepository):
    def __init__(self, file_storage: FileStorage) -> None:
        self.file_storage = file_storage
        super().__init__()

    async def insert(self, song: Song) -> None:
        if not song.metadata:
            raise ValueError("Missing song metadata")

        filename = get_filename_from_metadata(song.metadata, "pkl")
        obj = pickle.dumps(song)
        await self.file_storage.write(filename, obj)

    async def insert_many(self, songs: Iterable[Song]) -> None:
        keys = []
        for i in songs:
            if not i.metadata:
                raise ValueError("Missing song metadata")
            filename = get_filename_from_metadata(i.metadata, "pkl")
            keys.append(filename)
        await asyncio.gather(
            *[self.file_storage.write(k, pickle.dumps(v)) for k, v in zip(keys, songs)]
        )

    async def list_keys(self) -> list[str]:
        extensions = ("mid", "pkl")
        keys: list[str] = []
        keys = [
            i for i in self.file_storage.list_all() if i.split(".")[-1] in extensions
        ]

        # Return only .mid keys, that do not have .pkl equivalent
        file_names = [i.split("/")[-1] for i in keys]
        new_keys = []
        for k in keys:
            extension = k.split(".")[-1]
            if not (
                extension == "mid"
                and k.split("/")[-1].removesuffix(".mid") + ".pkl" in file_names
            ):
                new_keys.append(k)
        return new_keys

    async def load_song_async(self, file_path: str) -> Song:
        extension = file_path.split(".")[-1]
        if extension == "mid":
            return await self.__load_from_midi_async(file_path)
        elif extension == "pkl":
            return await self.__load_from_pickle_async(file_path)
        else:
            raise ValueError()

    def __load_from_pickle(self, file_path: str) -> Song:
        return pickle.loads(self.file_storage.read_sync(file_path))

    def __load_from_midi(self, file_path: str) -> Song:
        artist, name = get_artist_name_from_filepath(file_path)
        song = MidiParser.parse(
            MidiFile(file=io.BytesIO(self.file_storage.read_sync(file_path))),
            artist,
            name,
        )

        logger.debug(f"Parsed file {file_path}")
        return song

    async def __load_from_pickle_async(self, file_path: str) -> Song:
        return pickle.loads(await self.file_storage.read(file_path))

    async def __load_from_midi_async(self, file_path: str) -> Song:
        artist, name = get_artist_name_from_filepath(file_path)
        song = MidiParser.parse(
            MidiFile(file=io.BytesIO(await self.file_storage.read(file_path))),
            artist,
            name,
        )
        logger.debug(f"Parsed file {file_path}")

        return song

    async def __load_song_bytes(self, file_path: str, content: bytes) -> Song:
        extension = file_path.split(".")[-1]
        if extension == "mid":
            return await self.__parse_midi(content, file_path)
        elif extension == "pkl":
            return pickle.loads(content)
        else:
            raise ValueError()

    async def __parse_midi(self, midi: bytes, file_path: str):
        artist, name = get_artist_name_from_filepath(file_path)
        song = MidiParser.parse(MidiFile(file=io.BytesIO(midi)), artist, name)
        logger.debug(f"Parsed file {file_path}")

        return song

    async def get_all_songs(self) -> AsyncIterable[Song]:
        keys = self.list_keys()

        for i in asyncio.as_completed(
            [
                self.__load_song_bytes(*i)
                for i in await self.file_storage.read_all_keys(await keys)
            ]
        ):
            yield await i

    def load_song(self, file_path: str) -> Song:
        extension = file_path.split(".")[-1]
        if extension == "mid":
            return self.__load_from_midi(file_path)
        elif extension == "pkl":
            return self.__load_from_pickle(file_path)
        else:
            raise ValueError()
