from common.search_engine.strategy.similarity_strategy import (
    LCSStrategy,
    DTWStrategy,
    LocalAlignmentStrategy,
)
import numpy as np


def test_lcs():
    lcs = LCSStrategy()
    assert lcs.compare(np.array([1, 2, 3]), np.array([1, 2, 3])) == 3
    assert lcs.compare(np.array([1, 2, 3]), np.array([1, 2, 3, 4])) == 3
    assert lcs.compare(np.array([1, 3, 2, 3]), np.array([1, 2, 3])) == 3
    assert lcs.compare(np.array([1, 2, 2, 3]), np.array([1, 2, 3])) == 3
    assert lcs.compare(np.array([5, 1, 2, 3]), np.array([1, 2, 3])) == 3
    assert lcs.compare(np.array([1, 2, 3]), np.array([1, 2])) == 2
    assert lcs.compare(np.array([5, 2, 3]), np.array([1, 2, 3])) == 2
    assert lcs.compare(np.array([5, 2, 2, 2, 2, 2, 3]), np.array([5, 8, 3])) == 2


def test_dtw():
    dtw = DTWStrategy()
    assert dtw.compare(np.array([1, 2, 3]), np.array([1, 2, 3])) == 0
    assert dtw.compare(np.array([1, 2, 3]), np.array([1, 2, 3, 4])) == 1
    assert dtw.compare(np.array([1, 3, 2, 3]), np.array([1, 2, 3])) == 1
    assert dtw.compare(np.array([1, 2, 2, 3]), np.array([1, 2, 3])) == 0
    assert dtw.compare(np.array([5, 1, 2, 3]), np.array([1, 2, 3])) == 4
    assert dtw.compare(np.array([1, 2, 3]), np.array([1, 2])) == 1
    assert dtw.compare(np.array([5, 2, 3]), np.array([1, 2, 3])) == 4
    assert dtw.compare(np.array([5, 2, 2, 2, 2, 2, 3]), np.array([5, 8, 3])) == 8


def test_las():
    las = LocalAlignmentStrategy()
    assert las.compare(np.array([1, 2, 3]), np.array([1, 2, 3])) == 3
    assert las.compare(np.array([1, 2, 3]), np.array([1, 2, 3, 4])) == 3
    assert las.compare(np.array([1, 3, 2, 3]), np.array([1, 2, 3])) == 2
    assert las.compare(np.array([1, 2, 2, 3]), np.array([1, 2, 3])) == 2
    assert las.compare(np.array([5, 1, 2, 3]), np.array([1, 2, 3])) == 3
    assert las.compare(np.array([1, 2, 3]), np.array([1, 2])) == 2
    assert las.compare(np.array([5, 2, 3]), np.array([1, 2, 3])) == 2
    assert las.compare(np.array([5, 2, 2, 2, 2, 2, 3]), np.array([5, 8, 3])) == 1
