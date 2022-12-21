from http import HTTPStatus
from quart import Blueprint, request, jsonify
from app.worker.tasks import search
import logging
import config


logger = logging.getLogger(config.DEFAULT_LOGGER)
midi_bp = Blueprint("midi", __name__, url_prefix="/api/midi")


@midi_bp.get("/")
def midi_get():
    return "hello"


@midi_bp.post("/")
async def midi_post():
    data = await request.get_json()

    if not data:
        raise TypeError()

    res = search.send(data)
    serialized_songs = res.get_result(block=True, timeout=100000)
    logger.debug(f"Found {len(serialized_songs)} songs")
    res = {"tracks": serialized_songs}
    return jsonify(res)


@midi_bp.errorhandler(KeyError)
@midi_bp.errorhandler(TypeError)
def handle_key_error(e):
    logger.debug("Recieved invalid data format")
    return "Invalid data format", HTTPStatus.BAD_REQUEST
