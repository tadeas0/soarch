from app.search_engine.strategy.similarity_strategy import SimilarityStrategy
from quart import Blueprint, jsonify
import logging
import config


logger = logging.getLogger(config.DEFAULT_LOGGER)
similarity_strategy_bp = Blueprint("similarity-strategy", __name__,
                                   url_prefix="/api/similarity-strategy")


@similarity_strategy_bp.get("/")
def strategy_get():
    res = []
    for strategy in SimilarityStrategy.__subclasses__():
        s = strategy()  # type: ignore
        res.append({"name": s.name, "shortcut": s.shortcut})
    return jsonify(res)
