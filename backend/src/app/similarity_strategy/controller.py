from quart import Blueprint, jsonify
import config


similarity_strategy_bp = Blueprint("similarity-strategy", __name__,
                                   url_prefix="/api/similarity-strategy")


@similarity_strategy_bp.get("/")
def strategy_get():
    return jsonify(config.AVAILABLE_STRATEGIES)
