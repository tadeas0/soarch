from functools import lru_cache
from typing import List, Tuple, Set
from app.search_engine.repository import SongRepository
from app.search_engine.similarity_strategy import SimilarityStrategy
from app.search_engine.song import Song, Track
from app.search_engine.melody_extraction_strategy import MelodyExtractionStrategy
from app.search_engine.standardization_strategy import StandardizationStrategy


# TODO: test preprocessing caching
# TODO: cleanup result format
class SearchEngine:
    def __init__(
        self,
        repository: SongRepository,
        extraction_strategy: MelodyExtractionStrategy,
        standardization_strategy: StandardizationStrategy,
        similarity_strategy: SimilarityStrategy,
    ) -> None:
        self.repository = repository
        self.extraction_strategy = extraction_strategy
        self.standardization_strategy = standardization_strategy
        self.similarity_strategy = similarity_strategy

    def find_similar(self, n: int, query_track: Track) -> Set[Tuple[float, Song]]:
        songs: Set[Tuple[float, Song]] = set()
        query_prep = self.__preprocess_track(query_track)
        for song in self.repository.get_all():
            for track in song.tracks:
                sim = self.similarity_strategy.compare(
                    query_prep, self.__preprocess_track(track)
                )
                songs.add((sim, song))
        return songs

    @lru_cache()
    def __preprocess_track(self, track: Track):
        m = self.extraction_strategy.extract(track)
        return self.standardization_strategy.standardize(m)
