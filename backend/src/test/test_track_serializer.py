from app.midi.serializer import TrackSerializer
from common.entity.song import Note
import common.config as config


def test_ticks_to_bbbs():
    assert TrackSerializer.ticks_to_bbs(10, 100) == "0:0:0"
    assert TrackSerializer.ticks_to_bbs(20, 100) == "0:0:0"
    assert TrackSerializer.ticks_to_bbs(25, 100) == "0:0:1"
    assert TrackSerializer.ticks_to_bbs(30, 100) == "0:0:1"
    assert TrackSerializer.ticks_to_bbs(40, 100) == "0:0:1"
    assert TrackSerializer.ticks_to_bbs(50, 100) == "0:0:2"
    assert TrackSerializer.ticks_to_bbs(60, 100) == "0:0:2"
    assert TrackSerializer.ticks_to_bbs(70, 100) == "0:0:2"
    assert TrackSerializer.ticks_to_bbs(75, 100) == "0:0:3"
    assert TrackSerializer.ticks_to_bbs(80, 100) == "0:0:3"
    assert TrackSerializer.ticks_to_bbs(100, 100) == "0:1:0"
    assert TrackSerializer.ticks_to_bbs(150, 100) == "0:1:2"
    assert TrackSerializer.ticks_to_bbs(170, 100) == "0:1:2"
    assert TrackSerializer.ticks_to_bbs(175, 100) == "0:1:3"
    assert TrackSerializer.ticks_to_bbs(200, 100) == "0:2:0"
    assert TrackSerializer.ticks_to_bbs(400, 100) == "1:0:0"
    assert TrackSerializer.ticks_to_bbs(425, 100) == "1:0:1"
    assert TrackSerializer.ticks_to_bbs(525, 100) == "1:1:1"


def test_serialize_note():
    assert TrackSerializer.serialize_note(Note(120, 500, 100)) == {
        "time": "0:0:1",
        "length": "0:1:0",
        "pitch": 100,
    }
    assert TrackSerializer.serialize_note(Note(240, 300, 20)) == {
        "time": "0:0:2",
        "length": "0:0:2",
        "pitch": 20,
    }
    assert TrackSerializer.serialize_note(Note(360, 521, 53)) == {
        "time": "0:0:3",
        "length": "0:1:0",
        "pitch": 53,
    }
    assert TrackSerializer.serialize_note(Note(480, 328, 31)) == {
        "time": "0:1:0",
        "length": "0:0:2",
        "pitch": 31,
    }
    assert TrackSerializer.serialize_note(Note(900, 1500, 31)) == {
        "time": "0:1:3",
        "length": "0:3:0",
        "pitch": 31,
    }
    assert TrackSerializer.serialize_note(Note(480, 250, 31)) == {
        "time": "0:1:0",
        "length": "0:0:2",
        "pitch": 31,
    }


def test_trim_notes():
    n1 = [Note(config.DEFAULT_PPQ * 4, config.DEFAULT_PPQ, 0)]
    assert TrackSerializer.trim_notes(n1), [Note(0, config.DEFAULT_PPQ, 0)]

    n2 = [
        Note(config.DEFAULT_PPQ * 5, config.DEFAULT_PPQ, 0),
        Note(config.DEFAULT_PPQ * 6, config.DEFAULT_PPQ, 0),
        Note(config.DEFAULT_PPQ * 7, config.DEFAULT_PPQ, 0),
    ]
    assert TrackSerializer.trim_notes(n2) == [
        Note(config.DEFAULT_PPQ * 1, config.DEFAULT_PPQ, 0),
        Note(config.DEFAULT_PPQ * 2, config.DEFAULT_PPQ, 0),
        Note(config.DEFAULT_PPQ * 3, config.DEFAULT_PPQ, 0),
    ]

    n3 = [
        Note(config.DEFAULT_PPQ, config.DEFAULT_PPQ, 0),
        Note(config.DEFAULT_PPQ * 2, config.DEFAULT_PPQ, 0),
        Note(config.DEFAULT_PPQ * 7, config.DEFAULT_PPQ, 0),
    ]
    assert TrackSerializer.trim_notes(n3) == [
        Note(config.DEFAULT_PPQ, config.DEFAULT_PPQ, 0),
        Note(config.DEFAULT_PPQ * 2, config.DEFAULT_PPQ, 0),
        Note(config.DEFAULT_PPQ * 7, config.DEFAULT_PPQ, 0),
    ]

    n4 = [
        Note(config.DEFAULT_PPQ * 8, config.DEFAULT_PPQ, 0),
        Note(config.DEFAULT_PPQ * 5, config.DEFAULT_PPQ, 0),
        Note(config.DEFAULT_PPQ * 7, config.DEFAULT_PPQ, 0),
    ]
    assert TrackSerializer.trim_notes(n4) == [
        Note(config.DEFAULT_PPQ * 4, config.DEFAULT_PPQ, 0),
        Note(config.DEFAULT_PPQ * 1, config.DEFAULT_PPQ, 0),
        Note(config.DEFAULT_PPQ * 3, config.DEFAULT_PPQ, 0),
    ]

    n5 = [
        Note(config.DEFAULT_PPQ * 18, config.DEFAULT_PPQ, 0),
        Note(config.DEFAULT_PPQ * 17, config.DEFAULT_PPQ, 0),
        Note(config.DEFAULT_PPQ * 16, config.DEFAULT_PPQ, 0),
    ]
    assert TrackSerializer.trim_notes(n5) == [
        Note(config.DEFAULT_PPQ * 2, config.DEFAULT_PPQ, 0),
        Note(config.DEFAULT_PPQ * 1, config.DEFAULT_PPQ, 0),
        Note(config.DEFAULT_PPQ * 0, config.DEFAULT_PPQ, 0),
    ]
    n6 = [
        Note(config.DEFAULT_PPQ * 18, config.DEFAULT_PPQ, 0),
        Note(config.DEFAULT_PPQ * 17, config.DEFAULT_PPQ, 0),
        Note(config.DEFAULT_PPQ * 6, config.DEFAULT_PPQ, 0),
    ]
    assert TrackSerializer.trim_notes(n6) == [
        Note(config.DEFAULT_PPQ * 14, config.DEFAULT_PPQ, 0),
        Note(config.DEFAULT_PPQ * 13, config.DEFAULT_PPQ, 0),
        Note(config.DEFAULT_PPQ * 2, config.DEFAULT_PPQ, 0),
    ]
