import io
import re
from typing import Generator
from app.midi.filestorage import FileStorage
from app.midi.parser import MidiParser
from miditoolkit.midi import MidiFile
import pickle
import logging
from app.midi.song import Song, SongMetadata
import config


logger = logging.getLogger(config.DEFAULT_LOGGER)


class SongRepository:
    def __init__(self, file_storage: FileStorage) -> None:
        self.file_storage = file_storage
        self.directories: list[str] = []

    def load_song(self, file_path: str) -> Song:
        extension = file_path.split(".")[-1]
        if extension == "mid":
            return self.__load_from_midi(file_path)
        elif extension == "pkl":
            return self.__load_from_pickle(file_path)
        else:
            raise ValueError()

    def load_directory(self, directory: str) -> None:
        logger.debug(f"Loading directory {directory}")
        self.directories.append(directory)
        logger.debug(f"Loaded directory {directory}")

    def get_all(self) -> Generator[Song, None, None]:
        for d in self.directories:
            for i in self.file_storage.list_prefix(d):
                yield self.load_song(i)

    def list_keys(self) -> list[str]:
        extensions = ("mid", "pkl")
        keys: list[str] = []
        for d in self.directories:
            dir_content = self.file_storage.list_prefix(d)
            matched_files = filter(
                lambda a: a.split(".")[-1] in extensions, dir_content
            )
            keys.extend(matched_files)
        
        # Return only .mid keys, that do not have .pkl equivalent
        new_keys = []
        for k in keys:
            extension = k.split(".")[-1]
            if not (extension == "mid" and k.removesuffix(".mid") + ".pkl" in keys):
                new_keys.append(k)
        return new_keys

    def __load_from_pickle(self, file_path: str) -> Song:
        with self.file_storage.open(file_path, "rb") as f:
            return pickle.load(f)

    def __load_from_midi(self, file_path: str) -> Song:
        with self.file_storage.open(file_path, "rb") as f:
            song = MidiParser.parse(MidiFile(file=f))
            last = file_path.split("/")[-1]

            m = re.match(r"([a-zA-Z0-9 ]*) - ([a-zA-Z0-9 ]*)\.mid$", last)
            artist = "Unknown artist"
            name = "Unknown song"
            if m and m.group(1):
                artist = m.group(1)
            if m and m.group(2):
                name = m.group(2)
            song.metadata = SongMetadata(artist, name)
            return song

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
