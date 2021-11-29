from http import HTTPStatus
from quart import Blueprint, request, jsonify
from app.midi.parser import JsonParser
from app.midi.serializer import TrackSerializer
from app import repository
from app.search_engine.search_engine_factory import SearchEngineFactory
import config


midi_bp = Blueprint("midi", __name__, url_prefix="/api/midi")


@midi_bp.get("/")
def midi_get():
    return "hello"


@midi_bp.post("/")
async def midi_post():
    data = await request.get_json()
    song = JsonParser.parse(data)
    engine = SearchEngineFactory.create_search_engine(
        repository, config.DEFAULT_STRATEGY)
    similar_songs = await engine.find_similar_async(10, song.tracks[0])
    serialized_songs = [
        TrackSerializer.serialize_with_metadata(i[1], i[2]) for i in similar_songs
    ]
    res = {"tracks": serialized_songs}
    return jsonify(res)


@midi_bp.errorhandler(KeyError)
@midi_bp.errorhandler(TypeError)
def handle_key_error(e):
    return "Invalid data format", HTTPStatus.BAD_REQUEST
