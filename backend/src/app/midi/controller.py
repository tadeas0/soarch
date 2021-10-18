from http import HTTPStatus
from flask import Blueprint, request
from app.search_engine.parser import JsonParser
from app.search_engine.serializer import TrackSerializer
from app import engine

midi_bp = Blueprint("midi", __name__, url_prefix="/midi")


@midi_bp.get("/")
def midi_get():
    return "hello"


@midi_bp.post("/")
def midi_post():
    data = request.get_json()
    song = JsonParser.parse(data)
    similar_songs = engine.find_similar(10, song.tracks[0])
    serialized_songs = [
        TrackSerializer.serialize_with_metadata(i[1].metadata, i[2])
        for i in similar_songs
    ]
    res = {"tracks": serialized_songs}

    return res


@midi_bp.errorhandler(KeyError)
def handle_key_error(e):
    return "Invalid data format", HTTPStatus.BAD_REQUEST
