import config
import numpy as np


class JsonParser:
    @staticmethod
    def parse(data):
        notes = data["notes"]
        parsed_notes = sorted(
            [JsonParser.__parse_note(i) for i in notes], key=lambda n: n["time"]
        )
        length = max(i["time"] + i["length"] for i in parsed_notes)
        res = np.zeros(length)
        for i in parsed_notes:
            if i["pitch"] > res[i["time"]]:
                res[i["time"] : i["time"] + i["length"]] = i["pitch"]

        return res

    @staticmethod
    def __parse_bars_beats_sixteenths(bbs: str) -> int:
        s = bbs.split(":")
        return int(s[0]) * 16 + int(s[1]) * 4 + int(s[2])

    @staticmethod
    def __parse_note(note):
        return {
            "time": JsonParser.__parse_bars_beats_sixteenths(note["time"]),
            "length": JsonParser.__parse_bars_beats_sixteenths(note["length"]),
            "pitch": note["pitch"],
        }
