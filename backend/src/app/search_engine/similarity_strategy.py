from abc import ABC, abstractmethod
import numpy as np
from scipy.stats import wasserstein_distance
from fastdtw import fastdtw
from Bio import pairwise2


class SimilarityStrategy(ABC):
    @abstractmethod
    def compare(self, line1, line2) -> float:
        pass


class EMDStrategy(SimilarityStrategy):
    def compare(self, line1, line2) -> float:
        return wasserstein_distance(line1, line2)


class LCSStrategy(SimilarityStrategy):
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
    def compare(self, line1, line2) -> float:
        dist, _ = fastdtw(line1, line2)
        return dist


class LocalAlignmentStrategy(SimilarityStrategy):
    def compare(self, line1, line2) -> float:
        tl1 = "".join(chr(int(i) + 128) for i in line1)
        tl2 = "".join(chr(int(i) + 128) for i in line2)
        return pairwise2.align.localms(tl1, tl2, 1, -1, -2, -2, score_only=True)
