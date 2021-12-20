from app.util.song import Song, Track, Note
from app.util.parser.helpers import scale_ticks
import config


class JsonParser:
    @staticmethod
    def parse(data) -> Song:
        notes = data["notes"]
        bpm = data.get("bpm", 120)
        return Song(
            [
                Track(
                    [JsonParser.parse_note(i) for i in notes],
                    scale_ticks(4, config.DEFAULT_PPQ, data["gridLength"]),
                )
            ],
            bpm,
            None,
        )

    @staticmethod
    def __parse_bars_beats_sixteenths(bbs: str) -> int:
        s = bbs.split(":")
        sixteenths = int(s[0]) * 16 + int(s[1]) * 4 + int(s[2])
        return scale_ticks(4, config.DEFAULT_PPQ, sixteenths)

    @staticmethod
    def parse_note(note) -> Note:
        return Note(
            JsonParser.__parse_bars_beats_sixteenths(note["time"]),
            JsonParser.__parse_bars_beats_sixteenths(note["length"]),
            note["pitch"],
        )
