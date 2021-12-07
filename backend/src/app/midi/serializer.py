from typing import Union
from app.midi.song import Note, Track, Song
from math import floor
import config


class TrackSerializer:
    @staticmethod
    def serialize_with_metadata(
        song: Song, track: Track, trim=True
    ) -> dict[str, Union[str, int, list[dict[str, Union[str, int]]]]]:
        track_notes = track.notes
        if trim:
            track_notes = TrackSerializer.trim_notes(track_notes)
        serialized_notes = [TrackSerializer.serialize_note(i) for i in track_notes]

        if song.metadata:
            return {
                "artist": song.metadata.artist,
                "name": song.metadata.name,
                "notes": serialized_notes,
                "bpm": song.bpm,
            }
        else:
            return {
                "artist": "Unknown artist",
                "name": "Unknown song",
                "notes": serialized_notes,
                "bpm": song.bpm,
            }

    @staticmethod
    def serialize_note(note: Note) -> dict[str, Union[str, int]]:
        n: dict[str, Union[str, int]] = {
            "pitch": note.pitch,
            "time": TrackSerializer.ticks_to_bbs(note.time, config.DEFAULT_PPQ),
            "length": TrackSerializer.ticks_to_bbs(note.length, config.DEFAULT_PPQ),
        }

        # NOTE: If note is shorter than 16th, make it 16th.
        # Happens with triplets and 32nd notes, which are currently not supported
        if n["length"] == "0:0:0":
            n["length"] = "0:0:1"
        return n

    @staticmethod
    def trim_notes(notes: list[Note]) -> list[Note]:
        min_time = min([i.time for i in notes])
        if min_time >= config.MEASURE_LENGTH:
            ltrim = config.MEASURE_LENGTH * (min_time // config.MEASURE_LENGTH)
            return [Note(n.time - ltrim, n.length, n.pitch) for n in notes]
        return notes

    @staticmethod
    def ticks_to_bbs(ticks: int, ppq: int) -> str:
        measures = floor(ticks / (ppq * 4))
        quarters = floor((ticks % (ppq * 4)) / ppq)
        sixteenths = floor((ticks % ppq) / (ppq / 4))
        return f"{measures}:{quarters}:{sixteenths}"
