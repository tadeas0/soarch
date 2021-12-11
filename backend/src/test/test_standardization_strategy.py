import unittest
import numpy as np
from app.search_engine.strategy.standardization_strategy import (
    DefaultStrategy,
    RelativeIntervalStrategy,
)


def test_default_strategy():
    ds = DefaultStrategy()
    assert ds.standardize([1, 2, 3]) == [1, 2, 3]


def test_relative_interval_strategy():
    case = unittest.TestCase()
    ris = RelativeIntervalStrategy()
    np.testing.assert_array_equal(ris.standardize([1, 2, 5, 4, 2]), [0, 1, 3, -1, -2])
