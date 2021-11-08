from quart import Quart
import config
import logging
import json
from app.midi.filestorage import FileStorage, GoogleCloudFileStorage, LocalFileStorage
from app.midi.repository import SongRepository
from app.search_engine.search_engine import SearchEngine
from app.search_engine.similarity_strategy import LCSStrategy
from app.search_engine.melody_extraction_strategy import TopNoteStrategy
from app.search_engine.standardization_strategy import RelativeIntervalStrategy

if config.CLOUD_STORAGE_CREDENTIALS:
    file_storage: FileStorage = GoogleCloudFileStorage(
        json.loads(config.CLOUD_STORAGE_CREDENTIALS),
        config.BUCKET_NAME,
        config.REDIS_URL,
    )
else:
    file_storage = LocalFileStorage(config.MIDI_DIR)

repository = SongRepository(file_storage)
engine = SearchEngine(
    repository, TopNoteStrategy(), RelativeIntervalStrategy(), LCSStrategy()
)


def setup_logging():
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


def create_app():
    app = Quart(__name__)
    logger = setup_logging()
    logger.info("Logging initialized")

    app.url_map.strict_slashes = False

    from app.midi.controller import midi_bp
    from app.health_check.controller import health_check_bp

    app.register_blueprint(midi_bp)
    app.register_blueprint(health_check_bp)

    logger.info("Blueprints initialized")

    from app.scripts.parse_to_db import parse_to_db
    from app.scripts.scrape_robs_library import scrape_robs_library
    from app.scripts.scrape_freemidi import scrape_freemidi

    app.cli.add_command(parse_to_db)
    app.cli.add_command(scrape_freemidi)
    app.cli.add_command(scrape_robs_library)

    @app.before_first_request
    async def init_file_storage():
        await file_storage.initialize()
        repository.load_directory(config.PROCESSED_MIDI_PREFIX)

    if type(file_storage) == GoogleCloudFileStorage:
        logger.info("Using google cloud file storage")
    else:
        logger.info("Using local file storage")

    logger.info("Application initialized")

    return app
