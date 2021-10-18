from typing import List
import numpy as np
from functools import lru_cache


class Note:
    def __init__(self, time: int, length: int, pitch: int) -> None:
        self.time = time
        self.length = length
        self.pitch = pitch

    def __str__(self) -> str:
        return f"Note({self.time},{self.length},{self.pitch})"

    def __repr__(self) -> str:
        return f"Note({self.time},{self.length},{self.pitch})"


class Track:
    def __init__(self, notes: List[Note], grid_length: int) -> None:
        self.notes = notes
        self.grid_length = grid_length
        self.__is_sorted = False

    @property  # type: ignore
    @lru_cache()
    def top_line(self):
        return self.__get_top_line()

    def __get_top_line(self):
        if not self.__is_sorted:
            self.notes = sorted(self.notes, key=lambda n: n.time)

        last_pitch = -1
        last_time = -1
        res: List[int] = []
        for i in self.notes:
            if i.time == last_time and i.pitch > last_pitch:
                res[-1] = i.pitch
            elif i.time > last_time:
                res.append(i.pitch)
                last_time = i.time
                last_pitch = i.pitch

        return np.array(res)


class SongMetadata:
    def __init__(self, artist, name) -> None:
        self.artist = artist
        self.name = name

    def __str__(self) -> str:
        return f"SongMetadata({self.artist}, {self.name})"


class Song:
    def __init__(self, tracks: List[Track], metadata: SongMetadata = None) -> None:
        self.tracks = tracks
        self.metadata = metadata
