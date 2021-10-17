from abc import ABC, abstractmethod
from app.search_engine.song import Song, Track
from scipy.stats import wasserstein_distance  # type: ignore


class SimilarityStrategy(ABC):
    @abstractmethod
    def measure(self, song1: Song, track2: Track) -> float:
        pass


class EMDStrategy(SimilarityStrategy):
    def measure(self, song1: Song, track2: Track) -> float:
        t1 = [i.top_line for i in song1.tracks]
        t2 = track2.top_line
        res = min(wasserstein_distance(i, t2) for i in t1)
        return res
