import unittest
from miditoolkit.midi import MidiFile, Instrument
from miditoolkit.midi.containers import Note
from app.midi.song import Note as MyNote
from app.midi.parser import MidiParser


class TestMidiParser(unittest.TestCase):
    def test_parse(self):
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

        song = MidiParser.parse(mid)

        n1 = song.tracks[0].notes
        self.assertTrue(n1[0].equals(MyNote(0, 40, 30)))
        self.assertTrue(n1[1].equals(MyNote(8, 4, 20)))
        self.assertTrue(n1[2].equals(MyNote(16, 6, 30)))

        n2 = song.tracks[1].notes
        self.assertTrue(n2[0].equals(MyNote(20, 20, 4)))
        self.assertTrue(n2[1].equals(MyNote(100, 2, 0)))
        self.assertTrue(n2[2].equals(MyNote(16, 84, 15)))


if __name__ == "__main__":
    unittest.main()
