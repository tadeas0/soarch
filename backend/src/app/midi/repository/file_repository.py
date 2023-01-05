from asyncio import Future
import asyncio
import io
import re
from typing import Iterable
from app.util.filestorage import FileStorage
from app.util.parser import MidiParser
from miditoolkit.midi import MidiFile
import pickle
import logging
from app.util.song import Song, SongMetadata
from app.midi.repository.repository import SongRepository
import config


logger = logging.getLogger(config.DEFAULT_LOGGER)


class FileRepository(SongRepository):
    def __init__(self, file_storage: FileStorage) -> None:
        self.file_storage = file_storage
        self.directories: list[str] = []
        super().__init__()

    def load_directory(self, directory: str) -> None:
        logger.debug(f"Loading directory {directory}")
        self.directories.append(directory)
        logger.debug(f"Loaded directory {directory}")

    async def list_keys(self) -> list[str]:
        extensions = ("mid", "pkl")
        keys: list[str] = []
        for d in self.directories:
            dir_content = self.file_storage.list_prefix(d)
            matched_files = filter(
                lambda a: a.split(".")[-1] in extensions, dir_content
            )
            keys.extend(matched_files)

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

    async def __load_from_pickle_async(self, file_path: str) -> Song:
        return pickle.loads(await self.file_storage.read(file_path))

    async def __load_from_midi_async(self, file_path: str) -> Song:
        song = MidiParser.parse(
            MidiFile(file=io.BytesIO(await self.file_storage.read(file_path)))
        )
        logger.debug(f"Parsed file {file_path}")
        last = file_path.split("/")[-1]

        m = re.match(r"(.*) - (.*)\.mid$", last)
        artist = "Unknown artist"
        name = "Unknown song"
        if m and m.group(1):
            artist = m.group(1)
        if m and m.group(2):
            name = m.group(2)
        song.metadata = SongMetadata(artist, name)
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
        song = MidiParser.parse(MidiFile(file=io.BytesIO(midi)))
        logger.debug(f"Parsed file {file_path}")
        last = file_path.split("/")[-1]

        m = re.match(r"(.*) - (.*)\.mid$", last)
        artist = "Unknown artist"
        name = "Unknown song"
        if m and m.group(1):
            artist = m.group(1)
        if m and m.group(2):
            name = m.group(2)
        song.metadata = SongMetadata(artist, name)
        return song

    async def get_all_songs(self) -> Iterable[Future[Song]]:
        keys = self.list_keys()

        return asyncio.as_completed(
            [
                self.__load_song_bytes(*i)
                for i in await self.file_storage.read_all_keys(await keys)
            ]
        )
