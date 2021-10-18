from abc import ABC, abstractmethod
import numpy as np


class StandardizationStrategy(ABC):
    @abstractmethod
    def standardize(self, top_line):
        pass


class DefaultStrategy(StandardizationStrategy):
    def standardize(self, top_line):
        return top_line


class RelativeIntervalStrategy(StandardizationStrategy):
    def standardize(self, top_line):
        res = np.zeros(len(top_line))
        for i in range(1, len(top_line)):
            res[i] = top_line[i] - top_line[i - 1]
        return res
