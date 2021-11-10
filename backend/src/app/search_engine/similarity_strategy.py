from abc import ABC, abstractmethod
import numpy as np
import numpy.typing as npt
from scipy.stats import wasserstein_distance
from fastdtw import fastdtw
from Bio import pairwise2


class SimilarityStrategy(ABC):
    highest_first = True

    @abstractmethod
    def compare(self, line1, line2) -> float:
        pass


class EMDStrategy(SimilarityStrategy):
    highest_first = False

    def compare(self, line1, line2) -> float:
        return wasserstein_distance(line1, line2)


class LCSStrategy(SimilarityStrategy):
    highest_first = True

    def __measure_aux(
        self, x: npt.NDArray[np.int64], y: npt.NDArray[np.int64]
    ) -> float:
        dp_table = np.zeros((len(x) + 1, len(y) + 1))
        for i in range(1, len(x) + 1):
            for j in range(1, len(y) + 1):
                if x[i - 1] == y[j - 1]:
                    dp_table[i - 1, j - 1] = 1 + dp_table[i - 2, j - 2]
                else:
                    dp_table[i - 1, j - 1] = max(
                        dp_table[i - 1, j - 2], dp_table[i - 2, j - 1]
                    )
        return dp_table[len(x) - 1, len(y) - 1]

    def compare(
        self, line1: npt.NDArray[np.int64], line2: npt.NDArray[np.int64]
    ) -> float:
        return self.__measure_aux(line1, line2)


class DTWStrategy(SimilarityStrategy):
    highest_first = False

    def compare(
        self, line1: npt.NDArray[np.int64], line2: npt.NDArray[np.int64]
    ) -> float:
        dist, _ = fastdtw(line1, line2)
        return dist


class LocalAlignmentStrategy(SimilarityStrategy):
    highest_first = True

    def compare(
        self, line1: npt.NDArray[np.int64], line2: npt.NDArray[np.int64]
    ) -> float:
        tl1 = "".join(chr(int(i) + 128) for i in line1)
        tl2 = "".join(chr(int(i) + 128) for i in line2)
        return pairwise2.align.localms(tl1, tl2, 1, -1, -2, -2, score_only=True)
