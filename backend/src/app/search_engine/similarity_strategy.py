from abc import ABC, abstractmethod
from app.search_engine.song import Song, Track
import numpy as np
from scipy.stats import wasserstein_distance  # type: ignore
from fastdtw import fastdtw  # type: ignore
from Bio import pairwise2  # type: ignore


class SimilarityStrategy(ABC):
    # @abstractmethod
    # def measure(self, song1: Song, track2: Track) -> float:
    #     pass

    @abstractmethod
    def compare(self, line1, line2) -> float:
        pass


class EMDStrategy(SimilarityStrategy):
    # def measure(self, song1: Song, track2: Track) -> float:
    #     t1 = [i.top_line for i in song1.tracks]
    #     t2 = track2.top_line
    #     res = min(
    #         wasserstein_distance(notesToRelative(i), notesToRelative(t2)) for i in t1
    #     )
    #     return res

    def compare(self, line1, line2) -> float:
        return wasserstein_distance(line1, line2)


class LCSStrategy(SimilarityStrategy):
    # def measure(self, song1: Song, track2: Track) -> float:
    #     t1 = [i.top_line for i in song1.tracks]
    #     return max(
    #         self.__measure_aux(notesToRelative(i), notesToRelative(track2.top_line))
    #         for i in t1
    #     )

    def __measure_aux(self, x, y):
        dp_table = np.zeros((len(x) + 1, len(y) + 1))
        # solve the problem in a bottom up manner
        for i in range(1, len(x) + 1):
            for j in range(1, len(y) + 1):
                if x[i - 1] == y[j - 1]:
                    dp_table[i - 1, j - 1] = 1 + dp_table[i - 2, j - 2]
                else:
                    dp_table[i - 1, j - 1] = max(
                        dp_table[i - 1, j - 2], dp_table[i - 2, j - 1]
                    )
        return dp_table[len(x) - 1, len(y) - 1]

    def compare(self, line1, line2) -> float:
        return self.__measure_aux(line1, line2)


class DTWStrategy(SimilarityStrategy):
    # def measure(self, song1: Song, track2: Track) -> float:
    #     t1 = [i.top_line for i in song1.tracks]
    #     d = []
    #     for i in t1:
    #         dist, _ = fastdtw(notesToRelative(i), notesToRelative(track2.top_line))
    #         d.append(dist)

    #     return min(d)

    def compare(self, line1, line2) -> float:
        dist, _ = fastdtw(line1, line2)
        return dist


class LocalAlignmentStrategy(SimilarityStrategy):
    # def measure(self, song1: Song, track2: Track) -> float:
    #     t1 = [i.top_line for i in song1.tracks]
    #     max_score = 0
    #     for tl in t1:
    #         tl1 = "".join(chr(int(i) + 128) for i in notesToRelative(tl))
    #         tl2 = "".join(chr(int(i) + 128) for i in notesToRelative(track2.top_line))
    #         score = pairwise2.align.localms(tl1, tl2, 1, -1, -2, -2, score_only=True)
    #         # score = pairwise2.align.localxx(tl1, tl2, score_only=True)
    #         if score > max_score:
    #             max_score = score

    #     return score

    def compare(self, line1, line2) -> float:
        tl1 = "".join(chr(int(i) + 128) for i in line1)
        tl2 = "".join(chr(int(i) + 128) for i in line2)
        return pairwise2.align.localms(tl1, tl2, 1, -1, -2, -2, score_only=True)


def notesToRelative(notes):
    res = np.zeros(len(notes))
    for i in range(1, len(notes)):
        res[i] = notes[i] - notes[i - 1]
    return res
