from app.search_engine.song import Note, SongMetadata, Track
from math import floor
import config


class TrackSerializer:
    @staticmethod
    def serialize_with_metadata(metadata: SongMetadata, track: Track):
        return {
            "artist": metadata.artist,
            "name": metadata.name,
            "notes": [TrackSerializer.serialize_note(i) for i in track.notes],
        }

    @staticmethod
    def serialize_note(note: Note):
        return {
            "pitch": note.pitch,
            "time": TrackSerializer.ticks_to_bbs(note.time, config.DEFAULT_PPQ),
            "length": TrackSerializer.ticks_to_bbs(note.length, config.DEFAULT_PPQ),
        }

    @staticmethod
    def ticks_to_bbs(ticks: int, ppq: int) -> str:
        measures = floor(ticks / (ppq * 4))
        quarters = floor((ticks % (ppq * 4)) / ppq)
        sixteenths = floor((ticks % ppq) / (ppq / 4))
        return f"{measures}:{quarters}:{sixteenths}"
