from quart import Quart
import config
import pytest
from app.entity.song import Song, SongMetadata, Track, Note


class MockAct:
    def __init__(self, *args, **kw) -> None:
        pass

    def send(self, *args, **kw):
        return MockRes()


class MockRes:
    def __init__(self) -> None:
        pass

    def get_result(self, *args, **kw):
        return [
            {
                "name": "song",
                "artist": "artist",
                "notes": [
                    {"pitch": 20, "length": "0:1:0", "time": "0:0:0"},
                    {"pitch": 20, "length": "0:1:0", "time": "0:1:0"},
                ],
                "bpm": 120,
            }
            for i in range(10)
        ]


@pytest.fixture()
def mock_search(monkeypatch):
    monkeypatch.setattr("dramatiq.actor", lambda **kw: MockAct)


@pytest.fixture
def app(mock_search):
    from app.midi.controller import midi_bp

    app = Quart(__name__)
    app.url_map.strict_slashes = False
    app.register_blueprint(midi_bp)
    return app


async def find_similar_async_mock(cls, *args):
    track = Track(
        [
            Note(0, config.DEFAULT_PPQ, 20),
            Note(config.DEFAULT_PPQ, config.DEFAULT_PPQ, 20),
        ],
        100,
    )
    return [
        (i, Song([track], SongMetadata("artist", "song", 120)), track)
        for i in range(10)
    ]


@pytest.mark.asyncio
async def test_midi_controller_success(app):
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
            "name": "song",
            "artist": "artist",
            "notes": [
                {"pitch": 20, "length": "0:1:0", "time": "0:0:0"},
                {"pitch": 20, "length": "0:1:0", "time": "0:1:0"},
            ],
            "bpm": 120,
        }
        for i in range(10)
    ]
    assert res_json == {"tracks": expected_songs}
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_midi_controller_bad_request(app):
    client = app.test_client()
    response1 = await client.post("/api/midi", data="asdfsdf")
    data1 = await response1.get_data()
    assert response1.status_code == 400
    assert data1 == b"Invalid data format"
