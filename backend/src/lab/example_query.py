from dataclasses import dataclass

from app.entity.song import SongMetadata, Track


@dataclass
class ExampleQuery:
    metadata: SongMetadata
    track: Track
