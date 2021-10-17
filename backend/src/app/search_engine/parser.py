from miditoolkit.midi import MidiFile  # type: ignore
from app.search_engine.song import Song, Track, Note
from math import floor
import config


def scaleTicks(oldPPQ: int, newPPQ: int, ticks: int) -> int:
    return floor((newPPQ / oldPPQ) * ticks)


class JsonParser:
    @staticmethod
    def parse(data) -> Song:
        notes = data["notes"]
        return Song(
            [Track([JsonParser.__parse_note(i) for i in notes], notes["gridLength"])]
        )

    @staticmethod
    def __parse_bars_beats_sixteenths(bbs: str) -> int:
        s = bbs.split(":")
        sixteenths = int(s[0]) * 16 + int(s[1]) * 4 + int(s[2])
        return scaleTicks(4, config.DEFAULT_PPQ, sixteenths)

    @staticmethod
    def __parse_note(note) -> Note:
        return Note(
            JsonParser.__parse_bars_beats_sixteenths(note["time"]),
            JsonParser.__parse_bars_beats_sixteenths(note["length"]),
            note["pitch"],
        )


class MidiParser:
    @staticmethod
    def parse(midi_file: MidiFile) -> Song:
        melodic_inst = filter(lambda inst: not inst.is_drum, midi_file.instruments)
        st = lambda t: scaleTicks(midi_file.max_tick, config.DEFAULT_PPQ, t)
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
            ]
        )
