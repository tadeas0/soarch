from app.midi.song import Song
from app.midi.parser import MidiParser
from miditoolkit.midi import MidiFile
from glob import glob
import os
import pickle
from typing import List


class SongRepository:
    def __init__(self) -> None:
        self.__songs: List[Song] = []

    def load_song(self, file_path: str):
        extension = file_path.split(".")[-1]
        if extension == "mid":
            self.__load_from_midi(file_path)
        elif extension == "pkl":
            self.__load_from_pickle(file_path)

    def load_directory(self, directory: str):
        extensions = ("*.mid", "*.pkl")
        matched_files: List[str] = []
        for i in extensions:
            matched_files.extend(glob(os.path.join(directory, i)))

        for i in matched_files:
            self.load_song(i)

    def get_all(self):
        return self.__songs

    def __load_from_pickle(self, file_path: str):
        with open(file_path, "rb") as f:
            self.__songs.append(pickle.load(f))

    def __load_from_midi(self, file_path: str):
        self.__songs.append(MidiParser.parse(MidiFile(file_path)))
