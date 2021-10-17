from app.search_engine.song import Song
from app.search_engine.parser import MidiParser
from miditoolkit.midi import MidiFile  # type: ignore
import glob
import os
from typing import List, Set


class SongRepository:
    def __init__(self) -> None:
        self.__songs: List[Song] = []

    def load_song(self, file_path: str):
        self.__songs.append(MidiParser.parse(MidiFile(file_path)))

    def load_directory(self, directory: str):
        for i in glob.glob(os.path.join(directory, "*.mid")):
            self.__songs.append(MidiParser.parse(MidiFile(i)))

    def get_all(self):
        return self.__songs
