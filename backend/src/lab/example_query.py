from dataclasses import dataclass

from app.util.song import SongMetadata, Track


@dataclass
class ExampleQuery:
    metadata: SongMetadata
    track: Track