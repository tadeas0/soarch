import json
from app.search_engine.search_engine import SearchEngine
import config
import pytest
from app import create_app
import mock
from app.midi.repository import SongRepository
from app.midi.song import Song, SongMetadata, Track, Note


@pytest.fixture
def app():
    return create_app()


async def find_similar_async_mock(cls, *args):
    track = Track(
        [
            Note(0, config.DEFAULT_PPQ, 20),
            Note(config.DEFAULT_PPQ, config.DEFAULT_PPQ, 20),
        ],
        100,
    )
    return [
        (i, Song([track], SongMetadata(f"artist", f"song")), track) for i in range(10)
    ]


@pytest.mark.asyncio
async def test_midi_controller_success(app):
    with mock.patch.object(
        SearchEngine, "find_similar_async", new=find_similar_async_mock
    ):
        client = app.test_client()
        response = await client.post(
            "/api/midi",
            json={
                "notes": [
                    {
                        "pitch": 100,
                        "length": "0:0:1",
                        "time": "0:0:0",
                    }
                ],
                "gridLength": 100,
            },
        )

        res_json = await response.get_json()

        expected_songs = [
            {
                "name": f"song",
                "artist": f"artist",
                "notes": [
                    {"pitch": 20, "length": "0:1:0", "time": "0:0:0"},
                    {"pitch": 20, "length": "0:1:0", "time": "0:1:0"},
                ],
            }
            for i in range(10)
        ]
        assert res_json == {"tracks": expected_songs}
        assert response.status_code == 200


@pytest.mark.asyncio
async def test_midi_controller_bad_request(app):
    with mock.patch.object(
        SearchEngine, "find_similar_async", new=find_similar_async_mock
    ):
        client = app.test_client()
        response1 = await client.post("/api/midi", data="asdfsdf")
        data1 = await response1.get_data()
        assert response1.status_code == 400
        assert data1 == b"Invalid data format"

        response2 = await client.post("/api/midi", json={"123": "123"})
        data2 = await response2.get_data()
        assert response2.status_code == 400
        assert data2 == b"Invalid data format"

        response3 = await client.post(
            "/api/midi",
            json={
                "notes": [
                    {
                        "pitch": 100,
                        "length": "0:0:1",
                        "time": "0:0:0",
                    }
                ],
            },
        )
        data3 = await response3.get_data()
        assert response3.status_code == 400
        assert data3 == b"Invalid data format"
