from app.entity.song import Song, SongMetadata, Note, Track
from dataclasses import asdict


class MongoSerializer:
    @staticmethod
    def serialize(song: Song):
        return asdict(song)

    @staticmethod
    def __deserialize_note(note_dict: dict) -> Note:
        return Note(note_dict["time"], note_dict["length"], note_dict["pitch"])

    @staticmethod
    def __deserialize_track(track_dict: dict) -> Track:
        notes = [MongoSerializer.__deserialize_note(i) for i in track_dict["notes"]]
        return Track(notes, track_dict["grid_length"])

    @staticmethod
    def deserialize(song_dict: dict) -> Song:
        metadata = SongMetadata(
            song_dict["metadata"]["artist"],
            song_dict["metadata"]["name"],
            song_dict["metadata"]["bpm"],
        )
        tracks = [MongoSerializer.__deserialize_track(i) for i in song_dict["tracks"]]
        return Song(tracks, metadata)
