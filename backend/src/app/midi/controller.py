from http import HTTPStatus
from flask import Blueprint, request
from app.search_engine.parser import JsonParser

midi_bp = Blueprint("midi", __name__, url_prefix="/midi")


@midi_bp.get("/")
def midi_get():
    return "hello"


@midi_bp.post("/")
def midi_post():
    data = request.get_json()
    print(JsonParser.parse(data))
    return "test"


@midi_bp.errorhandler(KeyError)
def handle_key_error(e):
    return "Invalid data format", HTTPStatus.BAD_REQUEST
