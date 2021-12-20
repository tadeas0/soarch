from app.util.parser import JsonParser
from app.util.song import Note


def test_parse_note():
    n1 = JsonParser.parse_note({"time": "1:0:0", "length": "1:2:2", "pitch": 110})
    n2 = JsonParser.parse_note({"time": "0:0:0", "length": "0:0:3", "pitch": 50})
    n3 = JsonParser.parse_note({"time": "0:0:5", "length": "0:0:3", "pitch": 3})
    assert n1 == Note(1920, 3120, 110)
    assert n2 == Note(0, 360, 50)
    assert n3 == Note(600, 360, 3)


def test_parse():
    j1 = {
        "gridLength": 500,
        "notes": [
            {"time": "0:0:2", "length": "0:0:2", "pitch": 10},
            {"time": "0:0:5", "length": "0:0:3", "pitch": 15},
            {"time": "0:1:5", "length": "0:2:3", "pitch": 3},
        ],
    }
    res_notes = JsonParser.parse(j1).tracks[0].notes
    assert res_notes[0] == Note(240, 240, 10)
    assert res_notes[1] == Note(600, 360, 15)
    assert res_notes[2] == Note(1080, 1320, 3)
