from common.util.logging import setup_logging
import common.config as config
import dramatiq
from dramatiq.results import Results
from dramatiq.brokers.redis import RedisBroker
from dramatiq.results.backends import RedisBackend


def setup_broker():
    worker_backend = RedisBackend(url=config.REDIS_QUEUE_URL)
    broker = RedisBroker(url=config.REDIS_QUEUE_URL)
    broker.add_middleware(Results(backend=worker_backend))
    logger = setup_logging()
    logger.info("Logging initialized")
    dramatiq.set_broker(broker)
