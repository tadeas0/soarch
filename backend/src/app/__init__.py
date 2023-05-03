from quart import Quart
import common.config as config
from common.repository.mongo_repository_factory import MongoRepositoryFactory
from common.util.filestorage.local_file_storage import LocalFileStorage
from common.util.logging import setup_logging
import dramatiq
from dramatiq.brokers.redis import RedisBroker
from dramatiq.results.backends import RedisBackend
from dramatiq.results import Results

from midi_scraper.midi_scraper import parse_to_db


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

    @app.before_serving
    async def load_examples() -> None:
        logger.info("Loading example MIDI files to DB")
        fs = LocalFileStorage(config.EXAMPLE_DIR)
        fact = MongoRepositoryFactory()
        repo = fact.create_song_repository()
        await parse_to_db(fs, repo)
        logger.info("Finished loading example MIDI files to DB")

    return app
