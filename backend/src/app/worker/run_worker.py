from app.util.logging import setup_logging
import config
from . import file_storage
import dramatiq
from dramatiq.results import Results
from dramatiq.brokers.redis import RedisBroker
from app.util.filestorage import GoogleCloudFileStorage
from dramatiq.results.backends import RedisBackend


class InitRepoMiddleware(dramatiq.Middleware):
    def before_declare_actor(self, broker, actor):
        logger = setup_logging()
        logger.info("Logging initialized")

        if type(file_storage) == GoogleCloudFileStorage:
            logger.info("Using google cloud file storage")
        else:
            logger.info("Using local file storage")
        file_storage.initialize()
        logger.info("File storage initialized")

        return super().before_declare_actor(broker, actor)


worker_backend = RedisBackend(url=config.REDIS_QUEUE_URL)
broker = RedisBroker(url=config.REDIS_QUEUE_URL)
broker.add_middleware(Results(backend=worker_backend))
broker.add_middleware(InitRepoMiddleware())
dramatiq.set_broker(broker)
