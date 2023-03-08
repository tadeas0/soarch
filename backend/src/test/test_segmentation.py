from app.search_engine.strategy.segmentation_strategy import (
    OneSegmentStrategy,
    FixedLengthStrategy,
)
from common.entity.song import Track, Note
import unittest


def test_fixed_length_segmentation():
    fls = FixedLengthStrategy()
    case = unittest.TestCase()
    t1 = Track(
        [
            Note(0, 1, 1),
            Note(1, 1, 1),
            Note(2, 3, 1),
            Note(3, 2, 1),
            Note(4, 1, 1),
            Note(5, 1, 1),
        ],
        10,
    )
    r1 = [
        Track(
            [
                Note(0, 1, 1),
                Note(1, 1, 1),
                Note(2, 1, 1),
            ],
            3,
        ),
        Track(
            [
                Note(0, 2, 1),
                Note(1, 1, 1),
                Note(2, 1, 1),
            ],
            3,
        ),
    ]
    r2 = [
        Track(
            [
                Note(0, 1, 1),
                Note(1, 1, 1),
                Note(2, 3, 1),
                Note(3, 2, 1),
                Note(4, 1, 1),
                Note(5, 1, 1),
            ],
            6,
        )
    ]

    case.assertCountEqual(r1, fls.segment(t1, 3))
    case.assertCountEqual(r2, fls.segment(t1, 6))


def test_one_segment():
    oss = OneSegmentStrategy()
    case = unittest.TestCase()
    t1 = Track([Note(1, 2, 3), Note(3, 4, 5)], 10)
    r1 = [Track([Note(1, 2, 3), Note(3, 4, 5)], 10)]
    case.assertCountEqual(r1, oss.segment(t1, 10))
