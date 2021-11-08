import pytest
from app import create_app


@pytest.fixture
def app():
    return create_app()


@pytest.mark.asyncio
async def test_midi_controller_bad_request(app):
    client = app.test_client()
    response = await client.get("/api/healthcheck")
    assert response.status_code == 200
