from common.entity.job import Job, JobStatus
from common.entity.search_result import SearchResult
from common.entity.song import Note, Song, SongMetadata, SpotifyMetadata, Track
from common.util.mongo_serializer import MongoSerializer


def test_serialize_song():
    song = Song(
        [Track([Note(1, 1, 1), Note(2, 2, 2)], 10), Track([Note(2, 2, 2)], 10)],
        SongMetadata("artist", "name", 99),
    )
    assert MongoSerializer.serialize_song(song) == {
        "metadata": {"artist": "artist", "name": "name", "bpm": 99, "spotify": None},
        "tracks": [
            {
                "notes": [
                    {
                        "time": 1,
                        "length": 1,
                        "pitch": 1,
                    },
                    {
                        "time": 2,
                        "length": 2,
                        "pitch": 2,
                    },
                ],
                "grid_length": 10,
            },
            {
                "notes": [
                    {
                        "time": 2,
                        "length": 2,
                        "pitch": 2,
                    },
                ],
                "grid_length": 10,
            },
        ],
    }
    song2 = Song(
        [Track([Note(1, 1, 1), Note(2, 2, 2)], 10), Track([Note(2, 2, 2)], 10)],
        SongMetadata("artist", "name", 99, SpotifyMetadata("url1", "url2")),
    )
    assert MongoSerializer.serialize_song(song2) == {
        "metadata": {
            "artist": "artist",
            "name": "name",
            "bpm": 99,
            "spotify": {"preview_url": "url1", "song_url": "url2"},
        },
        "tracks": [
            {
                "notes": [
                    {
                        "time": 1,
                        "length": 1,
                        "pitch": 1,
                    },
                    {
                        "time": 2,
                        "length": 2,
                        "pitch": 2,
                    },
                ],
                "grid_length": 10,
            },
            {
                "notes": [
                    {
                        "time": 2,
                        "length": 2,
                        "pitch": 2,
                    },
                ],
                "grid_length": 10,
            },
        ],
    }


def test_deserialize_song():
    inp = {
        "metadata": {"artist": "artist", "name": "name", "bpm": 99, "spotify": None},
        "tracks": [
            {
                "notes": [
                    {
                        "time": 1,
                        "length": 1,
                        "pitch": 1,
                    },
                    {
                        "time": 2,
                        "length": 2,
                        "pitch": 2,
                    },
                ],
                "grid_length": 10,
            },
            {
                "notes": [
                    {
                        "time": 2,
                        "length": 2,
                        "pitch": 2,
                    },
                ],
                "grid_length": 10,
            },
        ],
    }
    assert MongoSerializer.deserialize_song(inp) == Song(
        [Track([Note(1, 1, 1), Note(2, 2, 2)], 10), Track([Note(2, 2, 2)], 10)],
        SongMetadata("artist", "name", 99),
    )
    inp2 = {
        "metadata": {
            "artist": "artist",
            "name": "name",
            "bpm": 99,
            "spotify": {"preview_url": "urlprev", "song_url": "urlsong"},
        },
        "tracks": [
            {
                "notes": [
                    {
                        "time": 1,
                        "length": 1,
                        "pitch": 1,
                    },
                    {
                        "time": 2,
                        "length": 2,
                        "pitch": 2,
                    },
                ],
                "grid_length": 10,
            },
            {
                "notes": [
                    {
                        "time": 2,
                        "length": 2,
                        "pitch": 2,
                    },
                ],
                "grid_length": 10,
            },
        ],
    }
    assert MongoSerializer.deserialize_song(inp2) == Song(
        [Track([Note(1, 1, 1), Note(2, 2, 2)], 10), Track([Note(2, 2, 2)], 10)],
        SongMetadata(
            "artist",
            "name",
            99,
            SpotifyMetadata("urlprev", "urlsong"),
        ),
    )


def test_serialize_search_result():
    res = SearchResult(
        SongMetadata("artist", "name", 99),
        1.5,
        Track([Note(1, 1, 1), Note(2, 2, 2)], 10),
    )
    assert MongoSerializer.serialize_search_result(res) == {
        "metadata": {
            "artist": "artist",
            "name": "name",
            "bpm": 99,
            "spotify": None,
        },
        "similarity": 1.5,
        "track": {
            "notes": [
                {
                    "time": 1,
                    "length": 1,
                    "pitch": 1,
                },
                {
                    "time": 2,
                    "length": 2,
                    "pitch": 2,
                },
            ],
            "grid_length": 10,
        },
    }


def test_deserialize_search_result():
    inp = {
        "metadata": {
            "artist": "artist",
            "name": "name",
            "bpm": 99,
            "spotify": None,
        },
        "similarity": 1.5,
        "track": {
            "notes": [
                {
                    "time": 1,
                    "length": 1,
                    "pitch": 1,
                },
                {
                    "time": 2,
                    "length": 2,
                    "pitch": 2,
                },
            ],
            "grid_length": 10,
        },
    }
    assert MongoSerializer.deserialize_search_result(inp) == SearchResult(
        SongMetadata("artist", "name", 99),
        1.5,
        Track([Note(1, 1, 1), Note(2, 2, 2)], 10),
    )


def test_serialize_job():
    res = SearchResult(
        SongMetadata("artist", "name", 99),
        1.5,
        Track([Note(1, 1, 1), Note(2, 2, 2)], 10),
    )
    job = Job("123", JobStatus.COMPLETED, [res])
    out = {
        "_id": "123",
        "status": "completed",
        "results": [
            {
                "metadata": {
                    "artist": "artist",
                    "name": "name",
                    "bpm": 99,
                    "spotify": None,
                },
                "similarity": 1.5,
                "track": {
                    "notes": [
                        {
                            "time": 1,
                            "length": 1,
                            "pitch": 1,
                        },
                        {
                            "time": 2,
                            "length": 2,
                            "pitch": 2,
                        },
                    ],
                    "grid_length": 10,
                },
            }
        ],
    }
    assert MongoSerializer.serialize_job(job) == out

    job2 = Job("123", JobStatus.COMPLETED, None)
    out2 = {
        "_id": "123",
        "status": "completed",
        "results": None,
    }
    assert MongoSerializer.serialize_job(job2) == out2


def test_deserialize_job():
    res = SearchResult(
        SongMetadata("artist", "name", 99),
        1.5,
        Track([Note(1, 1, 1), Note(2, 2, 2)], 10),
    )
    inp = {
        "_id": "123",
        "status": "completed",
        "results": [
            {
                "metadata": {
                    "artist": "artist",
                    "name": "name",
                    "bpm": 99,
                    "spotify": None,
                },
                "similarity": 1.5,
                "track": {
                    "notes": [
                        {
                            "time": 1,
                            "length": 1,
                            "pitch": 1,
                        },
                        {
                            "time": 2,
                            "length": 2,
                            "pitch": 2,
                        },
                    ],
                    "grid_length": 10,
                },
            }
        ],
    }
    job = Job("123", JobStatus.COMPLETED, [res])
    assert MongoSerializer.deserialize_job(inp) == job

    inp2 = {
        "_id": "123",
        "status": "pending",
        "results": None,
    }

    job2 = Job("123", JobStatus.PENDING, None)
    assert MongoSerializer.deserialize_job(inp2) == job2
