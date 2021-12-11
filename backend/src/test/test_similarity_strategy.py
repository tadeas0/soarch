from app.search_engine.strategy.similarity_strategy import (
    LCSStrategy,
    DTWStrategy,
    LocalAlignmentStrategy,
)


def test_lcs():
    lcs = LCSStrategy()
    assert lcs.compare([1, 2, 3], [1, 2, 3]) == 3
    assert lcs.compare([1, 2, 3], [1, 2, 3, 4]) == 3
    assert lcs.compare([1, 3, 2, 3], [1, 2, 3]) == 3
    assert lcs.compare([1, 2, 2, 3], [1, 2, 3]) == 3
    assert lcs.compare([5, 1, 2, 3], [1, 2, 3]) == 3
    assert lcs.compare([1, 2, 3], [1, 2]) == 2
    assert lcs.compare([5, 2, 3], [1, 2, 3]) == 2
    assert lcs.compare([5, 2, 2, 2, 2, 2, 3], [5, 8, 3]) == 2


def test_dtw():
    dtw = DTWStrategy()
    assert dtw.compare([1, 2, 3], [1, 2, 3]) == 0
    assert dtw.compare([1, 2, 3], [1, 2, 3, 4]) == 1
    assert dtw.compare([1, 3, 2, 3], [1, 2, 3]) == 1
    assert dtw.compare([1, 2, 2, 3], [1, 2, 3]) == 0
    assert dtw.compare([5, 1, 2, 3], [1, 2, 3]) == 4
    assert dtw.compare([1, 2, 3], [1, 2]) == 1
    assert dtw.compare([5, 2, 3], [1, 2, 3]) == 4
    assert dtw.compare([5, 2, 2, 2, 2, 2, 3], [5, 8, 3]) == 8


def test_las():
    las = LocalAlignmentStrategy()
    assert las.compare([1, 2, 3], [1, 2, 3]) == 3
    assert las.compare([1, 2, 3], [1, 2, 3, 4]) == 3
    assert las.compare([1, 3, 2, 3], [1, 2, 3]) == 2
    assert las.compare([1, 2, 2, 3], [1, 2, 3]) == 2
    assert las.compare([5, 1, 2, 3], [1, 2, 3]) == 3
    assert las.compare([1, 2, 3], [1, 2]) == 2
    assert las.compare([5, 2, 3], [1, 2, 3]) == 2
    assert las.compare([5, 2, 2, 2, 2, 2, 3], [5, 8, 3]) == 1
