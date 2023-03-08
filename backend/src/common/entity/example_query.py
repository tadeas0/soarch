from dataclasses import dataclass

from common.entity.song import SongMetadata, Track


@dataclass
class ExampleQuery:
    metadata: SongMetadata
    track: Track
