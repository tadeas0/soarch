import unittest
from app.midi.serializer import TrackSerializer
from app.midi.song import Note
import config


class TestTrackSerializer(unittest.TestCase):
    def test_ticks_to_bbbs(self):
        self.assertEqual(TrackSerializer.ticks_to_bbs(10, 100), "0:0:0")
        self.assertEqual(TrackSerializer.ticks_to_bbs(20, 100), "0:0:0")
        self.assertEqual(TrackSerializer.ticks_to_bbs(25, 100), "0:0:1")
        self.assertEqual(TrackSerializer.ticks_to_bbs(30, 100), "0:0:1")
        self.assertEqual(TrackSerializer.ticks_to_bbs(40, 100), "0:0:1")
        self.assertEqual(TrackSerializer.ticks_to_bbs(50, 100), "0:0:2")
        self.assertEqual(TrackSerializer.ticks_to_bbs(60, 100), "0:0:2")
        self.assertEqual(TrackSerializer.ticks_to_bbs(70, 100), "0:0:2")
        self.assertEqual(TrackSerializer.ticks_to_bbs(75, 100), "0:0:3")
        self.assertEqual(TrackSerializer.ticks_to_bbs(80, 100), "0:0:3")
        self.assertEqual(TrackSerializer.ticks_to_bbs(100, 100), "0:1:0")
        self.assertEqual(TrackSerializer.ticks_to_bbs(150, 100), "0:1:2")
        self.assertEqual(TrackSerializer.ticks_to_bbs(170, 100), "0:1:2")
        self.assertEqual(TrackSerializer.ticks_to_bbs(175, 100), "0:1:3")
        self.assertEqual(TrackSerializer.ticks_to_bbs(200, 100), "0:2:0")
        self.assertEqual(TrackSerializer.ticks_to_bbs(400, 100), "1:0:0")
        self.assertEqual(TrackSerializer.ticks_to_bbs(425, 100), "1:0:1")
        self.assertEqual(TrackSerializer.ticks_to_bbs(525, 100), "1:1:1")

    def test_serialize_note(self):
        self.assertDictEqual(
            TrackSerializer.serialize_note(Note(120, 500, 100)),
            {"time": "0:0:1", "length": "0:1:0", "pitch": 100},
        )
        self.assertDictEqual(
            TrackSerializer.serialize_note(Note(240, 300, 20)),
            {"time": "0:0:2", "length": "0:0:2", "pitch": 20},
        )
        self.assertDictEqual(
            TrackSerializer.serialize_note(Note(360, 521, 53)),
            {"time": "0:0:3", "length": "0:1:0", "pitch": 53},
        )
        self.assertDictEqual(
            TrackSerializer.serialize_note(Note(480, 328, 31)),
            {"time": "0:1:0", "length": "0:0:2", "pitch": 31},
        )
        self.assertDictEqual(
            TrackSerializer.serialize_note(Note(900, 1500, 31)),
            {"time": "0:1:3", "length": "0:3:0", "pitch": 31},
        )
        self.assertDictEqual(
            TrackSerializer.serialize_note(Note(480, 250, 31)),
            {"time": "0:1:0", "length": "0:0:2", "pitch": 31},
        )

    def test_trim_notes(self):
        n1 = [Note(config.DEFAULT_PPQ * 4, 480, 20)]
        # self.assertCountEqual(TrackSerializer.trim_notes(n1), [Note(0, 480, 20)])


if __name__ == "__main__":
    unittest.main()
