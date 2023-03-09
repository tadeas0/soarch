from dataclasses import dataclass
from common.entity.song import SongMetadata, Track


@dataclass
class SearchResult:
    metadata: SongMetadata
    similarity: float
    track: Track
