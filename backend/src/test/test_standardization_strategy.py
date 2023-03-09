import numpy as np
from common.search_engine.strategy.standardization_strategy import (
    DefaultStrategy,
    RelativeIntervalStrategy,
    BaselineIntervalStrategy,
    ParsonsCodeStrategy,
)


def test_default_strategy():
    ds = DefaultStrategy()
    np.testing.assert_array_equal(ds.standardize(np.array([1, 2, 3])), [1, 2, 3])


def test_relative_interval_strategy():
    ris = RelativeIntervalStrategy()
    np.testing.assert_array_equal(
        ris.standardize(np.array([1, 2, 5, 4, 2])), [0, 1, 3, -1, -2]
    )


def test_baseline_interval_strategy():
    bs = BaselineIntervalStrategy()
    np.testing.assert_array_equal(
        bs.standardize(np.array([2, 3, 4, 1, 2])), [0, 1, 2, -1, 0]
    )


def test_parsons_code_strategy():
    pc = ParsonsCodeStrategy()
    np.testing.assert_array_equal(
        pc.standardize(np.array([10, 4, 9, 10, 10, 1])), [0, -1, 1, 1, 0, -1]
    )
