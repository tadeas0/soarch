from miditoolkit.midi import MidiFile, Instrument
from miditoolkit.midi.containers import Note
from app.util.song import Note as MyNote
from app.util.parser import MidiParser


def test_parse():
    mid = MidiFile(ticks_per_beat=240)
    i1 = Instrument(0, False)
    i1.notes.append(Note(100, 30, 0, 20))
    i1.notes.append(Note(100, 20, 4, 6))
    i1.notes.append(Note(100, 30, 8, 11))

    i2 = Instrument(0, False)
    i2.notes.append(Note(100, 4, 10, 20))
    i2.notes.append(Note(100, 0, 50, 51))
    i2.notes.append(Note(100, 15, 8, 50))

    mid.instruments.append(i1)
    mid.instruments.append(i2)

    song = MidiParser.parse(mid, "artist", "name")

    n1 = song.tracks[0].notes
    assert n1[0] == MyNote(0, 40, 30)
    assert n1[1] == MyNote(8, 4, 20)
    assert n1[2] == MyNote(16, 6, 30)

    n2 = song.tracks[1].notes
    assert n2[0] == MyNote(20, 20, 4)
    assert n2[1] == MyNote(100, 2, 0)
    assert n2[2] == MyNote(16, 84, 15)

    assert song.metadata.artist == "artist"
    assert song.metadata.name == "name"
