from http import HTTPStatus
from quart import Blueprint, request, jsonify
from app.midi.parser import JsonParser
from app.midi.serializer import TrackSerializer
from app import repository
from app.search_engine.search_engine_factory import SearchEngineFactory
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

    similarity_strategy = data.get(
        "similarityStrategy", config.DEFAULT_STRATEGY)

    song = JsonParser.parse(data)
    try:
        engine = SearchEngineFactory.create_search_engine(
            repository, similarity_strategy)
    except ValueError as e:
        logger.debug(f"Unknown strategy {similarity_strategy}")
        return str(e), HTTPStatus.BAD_REQUEST

    logger.debug(f"Searching using {similarity_strategy} similarity_strategy")
    similar_songs = await engine.find_similar_async(10, song.tracks[0])
    serialized_songs = [
        TrackSerializer.serialize_with_metadata(i[1], i[2]) for i in similar_songs
    ]
    logger.debug(f"Found {len(serialized_songs)} songs")
    res = {"tracks": serialized_songs}
    return jsonify(res)


@midi_bp.errorhandler(KeyError)
@midi_bp.errorhandler(TypeError)
def handle_key_error(e):
    logger.debug("Recieved invalid data format")
    return "Invalid data format", HTTPStatus.BAD_REQUEST
