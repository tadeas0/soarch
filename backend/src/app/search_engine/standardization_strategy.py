from abc import ABC, abstractmethod
import numpy as np
import numpy.typing as npt


class StandardizationStrategy(ABC):
    @abstractmethod
    def standardize(self, top_line: npt.NDArray[np.int64]) -> npt.NDArray[np.int64]:
        pass


class DefaultStrategy(StandardizationStrategy):
    def standardize(self, top_line: npt.NDArray[np.int64]) -> npt.NDArray[np.int64]:
        return top_line


class RelativeIntervalStrategy(StandardizationStrategy):
    def standardize(self, top_line: npt.NDArray[np.int64]) -> npt.NDArray[np.int64]:
        res = np.zeros(len(top_line))
        for i in range(1, len(top_line)):
            res[i] = top_line[i] - top_line[i - 1]
        return res
