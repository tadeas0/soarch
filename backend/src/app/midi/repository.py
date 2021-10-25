import io
from app.midi.filestorage import FileStorage
from app.midi.song import Song
from app.midi.parser import MidiParser
from miditoolkit.midi import MidiFile
import pickle
from typing import List


class SongRepository:
    def __init__(self, file_storage: FileStorage) -> None:
        self.file_storage = file_storage
        self.__song_keys: List[str] = []

    def load_song(self, file_path: str):
        extension = file_path.split(".")[-1]
        if extension == "mid":
            return self.__load_from_midi(file_path)
        elif extension == "pkl":
            return self.__load_from_pickle(file_path)

    def load_directory(self, directory: str):
        extensions = ("mid", "pkl")
        dir_content = self.file_storage.list_prefix(directory)
        matched_files = filter(lambda a: a.split(".")[-1] in extensions, dir_content)
        self.__song_keys.extend(matched_files)

    def get_all(self):
        for i in self.__song_keys:
            yield self.load_song(i)

    def list_keys(self):
        return self.__song_keys

    def __load_from_pickle(self, file_path: str):
        with self.file_storage.open(file_path, "rb") as f:
            return pickle.load(f)

    def __load_from_midi(self, file_path: str):
        with self.file_storage.open(file_path, "rb") as f:
            return MidiParser.parse(MidiFile(file=f))

    async def load_song_async(self, file_path: str):
        extension = file_path.split(".")[-1]
        if extension == "mid":
            return await self.__load_from_midi_async(file_path)
        elif extension == "pkl":
            return await self.__load_from_pickle_async(file_path)

    async def __load_from_pickle_async(self, file_path: str):
        return pickle.loads(await self.file_storage.read(file_path))

    async def __load_from_midi_async(self, file_path: str):
        return MidiParser.parse(
            MidiFile(file=io.BytesIO(await self.file_storage.read(file_path)))
        )
