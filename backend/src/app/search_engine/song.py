from typing import List
import numpy as np  # type: ignore


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

    def get_top_line(self):
        if not self.__is_sorted:
            self.notes = sorted(self.notes, key=lambda n: n.time)

        res = np.zeros(self.grid_length)
        last_index = 0
        for i in self.notes:
            if i["pitch"] > res[i["time"]]:
                res[i["time"] : i["time"] + i["length"]] = i["pitch"]
                last_index = i["time"] + i["length"]
            elif i["time"] + i["length"] > last_index:
                res[last_index : i["time"] + i["length"]] = i["pitch"]
                last_index = i["time"] + i["length"]

        return res


class SongMetadata:
    def __init__(self, artist, name) -> None:
        self.artist = artist
        self.name = name


class Song:
    def __init__(self, tracks: List[Track], metadata: SongMetadata = None) -> None:
        self.tracks = tracks
        self.metadata = metadata
