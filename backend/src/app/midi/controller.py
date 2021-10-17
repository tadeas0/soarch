from http import HTTPStatus
from flask import Blueprint, request
from app.search_engine.parser import JsonParser
from app import search_engine

midi_bp = Blueprint("midi", __name__, url_prefix="/midi")


@midi_bp.get("/")
def midi_get():
    return "hello"


@midi_bp.post("/")
def midi_post():
    data = request.get_json()
    song = JsonParser.parse(data)
    similar_songs = search_engine.find_similar(10, song.tracks[0])
    for i in similar_songs:
        print(f"{i[1].metadata.name} - {i[1].metadata.name} {i[0]}")
    return "test"


@midi_bp.errorhandler(KeyError)
def handle_key_error(e):
    return "Invalid data format", HTTPStatus.BAD_REQUEST
