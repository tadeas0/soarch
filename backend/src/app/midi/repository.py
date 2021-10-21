from app.midi.filestorage import FileStorage
from app.midi.song import Song
from app.midi.parser import MidiParser
from miditoolkit.midi import MidiFile
import pickle
from typing import List


class SongRepository:
    def __init__(self, file_storage: FileStorage) -> None:
        self.file_storage = file_storage
        self.__songs: List[Song] = []

    def load_song(self, file_path: str):
        extension = file_path.split(".")[-1]
        if extension == "mid":
            self.__load_from_midi(file_path)
        elif extension == "pkl":
            self.__load_from_pickle(file_path)

    def load_directory(self, directory: str):
        extensions = ("mid", "pkl")
        dir_content = self.file_storage.list_prefix(directory)
        matched_files = filter(lambda a: a.split(".")[-1] in extensions, dir_content)

        for i in matched_files:
            self.load_song(i)

    def get_all(self):
        return self.__songs

    def __load_from_pickle(self, file_path: str):
        with self.file_storage.open(file_path, "rb") as f:
            self.__songs.append(pickle.load(f))

    def __load_from_midi(self, file_path: str):
        with self.file_storage.open(file_path, "rb") as f:
            self.__songs.append(MidiParser.parse(MidiFile(file=f)))
