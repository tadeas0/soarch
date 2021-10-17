from abc import ABC, abstractmethod
from app.search_engine.song import Song, Track
from scipy.stats import wasserstein_distance


class SimilarityStrategy(ABC):
    @abstractmethod
    def measure(self, song1: Song, track2: Track) -> float:
        pass


class EMDStrategy(SimilarityStrategy):
    def measure(self, song1: Song, track2: Track) -> float:
        t1 = [i.get_top_line() for i in song1.tracks]
        t2 = track2.get_top_line()
        res = sum(wasserstein_distance(i, t2) for i in t1)
        return res
