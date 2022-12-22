from quart import Quart
import config
from app.util.logging import setup_logging
import dramatiq
from dramatiq.brokers.redis import RedisBroker
from dramatiq.results.backends import RedisBackend
from dramatiq.results import Results


def create_app() -> Quart:
    app = Quart(__name__)
    logger = setup_logging()
    logger.info("Logging initialized")

    app.url_map.strict_slashes = False

    worker_backend = RedisBackend(url=config.REDIS_QUEUE_URL)
    broker = RedisBroker(url=config.REDIS_QUEUE_URL)
    broker.add_middleware(Results(backend=worker_backend))
    dramatiq.set_broker(broker)

    from app.midi.controller import midi_bp
    from app.health_check.controller import health_check_bp
    from app.similarity_strategy.controller import similarity_strategy_bp
    from app.example_queries.controller import example_queries_bp

    app.register_blueprint(midi_bp)
    app.register_blueprint(health_check_bp)
    app.register_blueprint(similarity_strategy_bp)
    app.register_blueprint(example_queries_bp)

    logger.info("Blueprints initialized")
    logger.info("Application initialized")

    return app
