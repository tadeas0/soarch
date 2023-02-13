from dataclasses import dataclass
import numpy.typing as npt
import numpy as np
from typing import Optional


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
class SongMetadata:
    artist: str
    name: str


@dataclass
class Segment:
    track: Track
    processed_notes: npt.NDArray[np.int64]


@dataclass
class Song:
    tracks: list[Track]
    bpm: int
    metadata: Optional[SongMetadata]
    segments: Optional[list[Segment]] = None
