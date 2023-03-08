from app.util.logging import setup_logging
import config
from . import file_storage, repository
import dramatiq
from dramatiq.results import Results
from dramatiq.brokers.redis import RedisBroker
from app.util.filestorage import GoogleCloudFileStorage
from common.repository.mongo_song_repository import MongoSongRepository
from dramatiq.results.backends import RedisBackend


def setup_broker():
    worker_backend = RedisBackend(url=config.REDIS_QUEUE_URL)
    broker = RedisBroker(url=config.REDIS_QUEUE_URL)
    broker.add_middleware(Results(backend=worker_backend))
    logger = setup_logging()
    logger.info("Logging initialized")

    if type(file_storage) == GoogleCloudFileStorage:
        logger.info("Using google cloud file storage")
    else:
        logger.info("Using local file storage")
    if type(repository) == MongoSongRepository:
        logger.info("Using MongoDB repository")
    else:
        logger.info("Using file repository")
    file_storage.initialize()
    logger.info("File storage initialized")
    dramatiq.set_broker(broker)
