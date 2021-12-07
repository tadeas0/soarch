from miditoolkit.midi import MidiFile
from app.midi.song import Song, Track, Note
from math import floor
import config


def scaleTicks(oldPPQ: int, newPPQ: int, ticks: int) -> int:
    res = floor((newPPQ / oldPPQ) * ticks)
    return res


class JsonParser:
    @staticmethod
    def parse(data) -> Song:
        notes = data["notes"]
        bpm = data.get("bpm", 120)
        return Song(
            [
                Track(
                    [JsonParser.parse_note(i) for i in notes],
                    scaleTicks(4, config.DEFAULT_PPQ, data["gridLength"]),
                )
            ],
            bpm,
            None,
        )

    @staticmethod
    def __parse_bars_beats_sixteenths(bbs: str) -> int:
        s = bbs.split(":")
        sixteenths = int(s[0]) * 16 + int(s[1]) * 4 + int(s[2])
        return scaleTicks(4, config.DEFAULT_PPQ, sixteenths)

    @staticmethod
    def parse_note(note) -> Note:
        return Note(
            JsonParser.__parse_bars_beats_sixteenths(note["time"]),
            JsonParser.__parse_bars_beats_sixteenths(note["length"]),
            note["pitch"],
        )


class MidiParser:
    @staticmethod
    def parse(midi_file: MidiFile) -> Song:
        melodic_inst = filter(lambda inst: not inst.is_drum, midi_file.instruments)

        def st(t: int):
            return scaleTicks(midi_file.ticks_per_beat, config.DEFAULT_PPQ, t)

        bpm = 120
        for i in map(lambda c: c.tempo, midi_file.tempo_changes):
            if i > 0:
                bpm = i
                break

        return Song(
            [
                Track(
                    list(
                        map(
                            lambda n: Note(
                                st(n.start), st(n.end) - st(n.start), n.pitch
                            ),
                            inst.notes,
                        )
                    ),
                    st(midi_file.max_tick),
                )
                for inst in melodic_inst
            ],
            bpm,
            None,
        )
