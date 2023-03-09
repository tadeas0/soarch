from dataclasses import dataclass
from typing import Optional
import numpy.typing as npt
import numpy as np


@dataclass
class Note:
    time: int
    length: int
    pitch: int


@dataclass
class Track:
    notes: list[Note]
    grid_length: int


@dataclass
class SpotifyMetadata:
    preview_url: str
    song_url: str


@dataclass
class SongMetadata:
    artist: str
    name: str
    bpm: int
    spotify: Optional[SpotifyMetadata] = None

    @property
    def slug(self):
        return f"{self.artist} - {self.name}"


@dataclass
class Segment:
    track: Track
    processed_notes: npt.NDArray[np.int64]


@dataclass
class Song:
    tracks: list[Track]
    metadata: SongMetadata
