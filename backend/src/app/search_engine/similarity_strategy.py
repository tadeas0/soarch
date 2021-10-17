from abc import ABC, abstractmethod
from app.search_engine.song import Song


class SimilarityStrategy(ABC):
    @abstractmethod
    def measure(self, song1: Song, song2: Song) -> float:
        pass


class EMDStrategy(SimilarityStrategy):
    def measure(self, song1: Song, song2: Song) -> float:
        t1 = [i.get_top_line() for i in song1.tracks]
        print(t1)
        return 0
