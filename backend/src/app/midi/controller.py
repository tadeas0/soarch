from flask import Blueprint

midi_bp = Blueprint("midi", __name__, url_prefix="/midi")


@midi_bp.get("/")
def midi_get():
    return "hello"
