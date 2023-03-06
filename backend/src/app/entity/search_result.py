from dataclasses import dataclass
from app.entity.song import SongMetadata, Track


@dataclass
class SearchResult:
    metadata: SongMetadata
    similarity: float
    track: Track
