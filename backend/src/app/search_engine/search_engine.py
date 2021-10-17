from typing import List, Tuple, Set
from app.search_engine.repository import SongRepository
from app.search_engine.similarity_strategy import SimilarityStrategy
from app.search_engine.song import Song, Track


class SearchEngine:
    def __init__(
        self, repository: SongRepository, similarity_strategy: SimilarityStrategy
    ) -> None:
        self.repository = repository
        self.similarity_strategy = similarity_strategy

    def find_similar(self, n: int, track: Track) -> Set[Tuple[float, Song]]:
        songs: Set[Tuple[float, Song]] = set()
        for i in self.repository.get_all():
            s = self.similarity_strategy.measure(i, track)
            songs.add((s, i))
        return songs
