from dataclasses import dataclass
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
class Song:
    tracks: list[Track]
    metadata: Optional[SongMetadata]
