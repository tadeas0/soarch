from quart import Quart
import config
import logging
import json
from app.midi.filestorage import FileStorage, GoogleCloudFileStorage, LocalFileStorage
from app.midi.repository import SongRepository


if config.CLOUD_STORAGE_CREDENTIALS:
    file_storage: FileStorage = GoogleCloudFileStorage(
        json.loads(config.CLOUD_STORAGE_CREDENTIALS),
        config.BUCKET_NAME,
        config.REDIS_URL,
    )
else:
    file_storage = LocalFileStorage(config.MIDI_DIR)

repository = SongRepository(file_storage)


def setup_logging() -> logging.Logger:
    logger = logging.getLogger(config.DEFAULT_LOGGER)

    if config.ENV == "dev":
        logger.setLevel(logging.DEBUG)
    else:
        logger.setLevel(logging.INFO)

    sh = logging.StreamHandler()
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    sh.setFormatter(formatter)
    logger.addHandler(sh)
    return logger


def create_app() -> Quart:
    app = Quart(__name__)
    logger = setup_logging()
    logger.info("Logging initialized")

    app.url_map.strict_slashes = False

    from app.midi.controller import midi_bp
    from app.health_check.controller import health_check_bp
    from app.similarity_strategy.controller import similarity_strategy_bp
    from app.example_queries.controller import example_queries_bp

    app.register_blueprint(midi_bp)
    app.register_blueprint(health_check_bp)
    app.register_blueprint(similarity_strategy_bp)
    app.register_blueprint(example_queries_bp)

    logger.info("Blueprints initialized")

    @app.before_first_request
    async def init_file_storage():
        await file_storage.initialize()
        repository.load_directory(config.RAW_MIDI_PREFIX)
        repository.load_directory(config.PROCESSED_MIDI_PREFIX)
        repository.load_directory(config.RAW_EXAMPLE_PREFIX)
        repository.load_directory(config.PROCESSED_EXAMPLE_PREFIX)

    if type(file_storage) == GoogleCloudFileStorage:
        logger.info("Using google cloud file storage")
    else:
        logger.info("Using local file storage")

    logger.info("Application initialized")

    return app
