from quart import Quart
import config
import pytest
from common.entity.song import Song, SongMetadata, Track, Note
from test.mocks.mock_repository_factory import MockRepositoryFactory


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


@pytest.fixture()
def mock_repository_factory(monkeypatch):
    monkeypatch.setattr(
        "common.repository.mongo_repository_factory.MongoRepositoryFactory",
        MockRepositoryFactory,
    )


@pytest.fixture
def app(mock_search, mock_repository_factory):
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

    expected_result = {"id": "1", "status": "pending", "results": None}

    assert res_json == expected_result
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_midi_controller_get(app):
    client = app.test_client()
    response = await client.get("/api/midi/1")
    expected_result = {
        "id": "1",
        "status": "completed",
        "results": [
            {
                "artist": "artist",
                "name": "name",
                "bpm": 99,
                "similarity": 1.5,
                "notes": [{"pitch": 3, "length": "0:0:1", "time": "0:0:0"}],
            }
        ],
    }
    assert await response.get_json() == expected_result
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_midi_controller_bad_request(app):
    client = app.test_client()
    response1 = await client.post("/api/midi", data="asdfsdf")
    data1 = await response1.get_data()
    assert response1.status_code == 400
    assert data1 == b"Invalid data format"
