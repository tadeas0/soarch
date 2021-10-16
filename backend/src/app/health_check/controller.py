from flask import Blueprint

health_check_bp = Blueprint("healthcheck", __name__, url_prefix="/healthcheck")


@health_check_bp.get("/")
def midi_get():
    return ""
