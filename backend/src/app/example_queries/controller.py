from quart import Blueprint, jsonify
from app.example_queries.examples import EXAMPLES

example_queries_bp = Blueprint(
    "example-queries", __name__, url_prefix="/api/example-queries"
)


@example_queries_bp.get("/")
def midi_get():
    return jsonify(EXAMPLES)
