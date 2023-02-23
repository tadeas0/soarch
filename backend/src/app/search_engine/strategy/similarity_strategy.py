from abc import ABC, abstractmethod
import numpy as np
import numpy.typing as npt
from scipy.stats import wasserstein_distance
from fastdtw import fastdtw
from Bio import Align


class SimilarityStrategy(ABC):
    highest_first = True

    @property
    @abstractmethod
    def name(self) -> str:
        pass

    @property
    @abstractmethod
    def shortcut(self) -> str:
        pass

    @abstractmethod
    def compare(
        self, line1: npt.NDArray[np.int64], line2: npt.NDArray[np.int64]
    ) -> float:
        pass


class LCSStrategy(SimilarityStrategy):
    highest_first = True

    @property
    def name(self) -> str:
        return "Longest common subsequence"

    @property
    def shortcut(self) -> str:
        return "lcs"

    def compare(
        self, line1: npt.NDArray[np.int64], line2: npt.NDArray[np.int64]
    ) -> float:
        dp_table = np.zeros((len(line1) + 1, len(line2) + 1))
        for i in range(1, len(line1) + 1):
            for j in range(1, len(line2) + 1):
                if line1[i - 1] == line2[j - 1]:
                    dp_table[i - 1][j - 1] = 1 + dp_table[i - 2][j - 2]
                else:
                    dp_table[i - 1][j - 1] = max(
                        dp_table[i - 1][j - 2], dp_table[i - 2][j - 1]
                    )
        return dp_table[len(line1) - 1][len(line2) - 1]


class DTWStrategy(SimilarityStrategy):
    highest_first = False

    @property
    def name(self) -> str:
        return "Dynamic time warping"

    @property
    def shortcut(self) -> str:
        return "dtw"

    def compare(
        self, line1: npt.NDArray[np.int64], line2: npt.NDArray[np.int64]
    ) -> float:
        len1 = len(line1)
        len2 = len(line2)
        dtw = np.zeros((len1 + 1, len2 + 1))
        for i in range(len1 + 1):
            for j in range(len2 + 1):
                dtw[i][j] = np.inf
        dtw[0, 0] = 0
        for i in range(1, len1 + 1):
            for j in range(1, len2 + 1):
                cost = abs(line1[i - 1] - line2[j - 1])
                last_min = min(dtw[i - 1][j], dtw[i][j - 1], dtw[i - 1][j - 1])
                dtw[i][j] = cost + last_min
        return dtw[-1][-1]


class DTWWinStrategy(SimilarityStrategy):
    highest_first = False
    window = 3

    @property
    def name(self) -> str:
        return "Dynamic time warping with window constraint"

    @property
    def shortcut(self) -> str:
        return "dtwwin"

    def compare(
        self, line1: npt.NDArray[np.int64], line2: npt.NDArray[np.int64]
    ) -> float:
        n, m = len(line1), len(line2)
        w = np.max([self.window, abs(n - m)])
        dtw = np.zeros((n + 1, m + 1))

        for i in range(n + 1):
            for j in range(m + 1):
                dtw[i][j] = np.inf
        dtw[0][0] = 0

        for i in range(1, n + 1):
            for j in range(max(1, i - w), min(m, i + w) + 1):
                dtw[i][j] = 0

        for i in range(1, n + 1):
            for j in range(max(1, i - w), min(m, i + w) + 1):
                cost = abs(line1[i - 1] - line2[j - 1])
                last_min = min(dtw[i - 1][j], dtw[i][j - 1], dtw[i - 1][j - 1])
                dtw[i][j] = cost + last_min
        return dtw[-1][-1]


class FDTWStrategyLib(SimilarityStrategy):
    highest_first = False

    @property
    def name(self) -> str:
        return "Fast dynamic time warping (FastDTW library)"

    @property
    def shortcut(self) -> str:
        return "fdtwl"

    def compare(
        self, line1: npt.NDArray[np.int64], line2: npt.NDArray[np.int64]
    ) -> float:
        dist, _ = fastdtw(line1, line2, min(len(line1), len(line2)))
        return dist


class LocalAlignmentStrategy(SimilarityStrategy):
    highest_first = True

    @property
    def name(self) -> str:
        return "Local alignment"

    @property
    def shortcut(self) -> str:
        return "lca"

    def __clamp_num(self, a: int) -> int:
        if a < 0:
            return 0
        return a

    def compare(
        self, line1: npt.NDArray[np.int64], line2: npt.NDArray[np.int64]
    ) -> float:
        match = 1
        mismatch = -1
        gap = -2
        score_mat = np.zeros((len(line1) + 1, len(line2) + 1), dtype=np.float64)
        for i in range(1, len(line1) + 1):
            for j in range(1, len(line2) + 1):
                ln = self.__clamp_num(score_mat[i][j - 1] + gap)
                un = self.__clamp_num(score_mat[i - 1][j] + gap)
                if line1[i - 1] == line2[j - 1]:
                    dn = self.__clamp_num(score_mat[i - 1][j - 1] + match)
                else:
                    dn = self.__clamp_num(score_mat[i - 1][j - 1] + mismatch)
                score_mat[i][j] = max(ln, un, dn)
        return float(np.max(score_mat))


class LocalAlignmentStrategyLib(SimilarityStrategy):
    highest_first = True

    @property
    def name(self) -> str:
        return "Local alignment (Biopython library)"

    @property
    def shortcut(self) -> str:
        return "lcabp"

    def compare(
        self, line1: npt.NDArray[np.int64], line2: npt.NDArray[np.int64]
    ) -> float:
        tl1 = "".join(chr(int(i) + 128) for i in line1)
        tl2 = "".join(chr(int(i) + 128) for i in line2)
        pa = Align.PairwiseAligner(
            mode="local",
            match_score=1,
            mismatch_score=-1,
            extend_gap_score=-2,
            open_gap_score=-2,
        )
        return pa.score(tl1, tl2)


class EMDStrategySP(SimilarityStrategy):
    highest_first = False

    @property
    def name(self) -> str:
        return "Earth mover's distance (SciPy library)"

    @property
    def shortcut(self) -> str:
        return "emdsp"

    def compare(
        self, line1: npt.NDArray[np.int64], line2: npt.NDArray[np.int64]
    ) -> float:
        return wasserstein_distance(line1, line2)
