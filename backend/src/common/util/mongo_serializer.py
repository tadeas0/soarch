from common.entity.job import Job, JobStatus
from common.entity.search_result import SearchResult
from common.entity.song import Song, SongMetadata, Note, SpotifyMetadata, Track
from dataclasses import asdict


class MongoSerializer:
    @staticmethod
    def serialize_song(song: Song):
        return asdict(song)

    @staticmethod
    def __deserialize_note(note_dict: dict) -> Note:
        return Note(note_dict["time"], note_dict["length"], note_dict["pitch"])

    @staticmethod
    def __deserialize_track(track_dict: dict) -> Track:
        notes = [MongoSerializer.__deserialize_note(i) for i in track_dict["notes"]]
        return Track(notes, track_dict["grid_length"])

    @staticmethod
    def __deserialize_song_metadata(metadata_dict: dict) -> SongMetadata:
        spotify_metadata = None
        if metadata_dict["spotify"] is not None:
            spot_dict = metadata_dict["spotify"]
            spotify_metadata = SpotifyMetadata(
                spot_dict["preview_url"], spot_dict["song_url"]
            )
        return SongMetadata(
            metadata_dict["artist"],
            metadata_dict["name"],
            metadata_dict["bpm"],
            spotify_metadata,
        )

    @staticmethod
    def deserialize_song(song_dict: dict) -> Song:
        metadata = MongoSerializer.__deserialize_song_metadata(song_dict["metadata"])
        tracks = [MongoSerializer.__deserialize_track(i) for i in song_dict["tracks"]]
        return Song(tracks, metadata)

    @staticmethod
    def serialize_search_result(search_result: SearchResult):
        return asdict(search_result)

    @staticmethod
    def deserialize_search_result(search_dict: dict) -> SearchResult:
        metadata = MongoSerializer.__deserialize_song_metadata(search_dict["metadata"])
        track = MongoSerializer.__deserialize_track(search_dict["track"])
        return SearchResult(metadata, search_dict["similarity"], track)

    @staticmethod
    def serialize_job(job: Job):
        results = None
        if job.results is not None:
            results = [MongoSerializer.serialize_search_result(i) for i in job.results]
        return {
            "_id": job.id,
            "status": job.status.value,
            "results": results,
        }

    @staticmethod
    def deserialize_job(job: dict) -> Job:
        status = JobStatus(job["status"])
        res = None
        if job["results"] is not None:
            res = [MongoSerializer.deserialize_search_result(i) for i in job["results"]]
        return Job(str(job["_id"]), status, res)
