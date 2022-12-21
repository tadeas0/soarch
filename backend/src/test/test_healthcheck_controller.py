import pytest
from quart import Quart


@pytest.fixture
def app():
    from app.health_check.controller import health_check_bp

    app = Quart(__name__)
    app.url_map.strict_slashes = False
    app.register_blueprint(health_check_bp)
    return app


@pytest.mark.asyncio
async def test_midi_controller_bad_request(app):
    client = app.test_client()
    response = await client.get("/api/healthcheck")
    assert response.status_code == 200
