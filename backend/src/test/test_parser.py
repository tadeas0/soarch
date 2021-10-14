import unittest
from mido.messages.messages import Message

from mido.midifiles.midifiles import MidiFile
from mido.midifiles.tracks import MidiTrack
from app.midi.parser import Parser


class TestParser(unittest.TestCase):
    def test_parse(self):
        mid = MidiFile()
        track = MidiTrack()
        mid.tracks.append(track)
        track.append(Message("note_on", channel=0, note=1, velocity=110, time=0))
        track.append(Message("note_on", channel=0, note=1, velocity=0, time=5))
        track.append(Message("note_on", channel=0, note=2, velocity=100, time=5))
        track.append(Message("note_on", channel=0, note=2, velocity=0, time=3))
        track.append(Message("note_on", channel=0, note=2, velocity=0, time=3))

        mid2 = MidiFile()
        track2 = MidiTrack()
        mid2.tracks.append(track2)
        track2.append(Message("note_on", channel=0, note=1, velocity=110, time=0))
        track2.append(Message("note_on", channel=0, note=2, velocity=100, time=2))
        track2.append(Message("note_on", channel=0, note=2, velocity=0, time=3))
        track2.append(Message("note_on", channel=0, note=1, velocity=0, time=2))
        track2.append(Message("note_on", channel=0, note=3, velocity=100, time=2))
        track2.append(Message("note_on", channel=0, note=3, velocity=0, time=3))

        self.assertSequenceEqual(
            Parser.parse(mid)[0].tolist(),
            [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0],
        )

        self.assertSequenceEqual(
            Parser.parse(mid2)[0].tolist(), [1, 1, 2, 2, 2, 1, 1, 0, 0, 3, 3, 3]
        )


if __name__ == "__main__":
    unittest.main()
