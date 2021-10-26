from quart import Blueprint

health_check_bp = Blueprint("healthcheck", __name__, url_prefix="/api/healthcheck")


@health_check_bp.get("/")
def midi_get():
    return ""
