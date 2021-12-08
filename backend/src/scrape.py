import config
from midi_scraper.midi_scraper import scrape_free_midi, scrape_robs_midi_library
from app.midi.filestorage import FileStorage, GoogleCloudFileStorage, LocalFileStorage
import logging
import json


def __setup_logging():
    logger = logging.getLogger(config.SCRAPER_LOGGER)

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


if __name__ == "__main__":
    logger = __setup_logging()
    if config.CLOUD_STORAGE_CREDENTIALS:
        file_storage: FileStorage = GoogleCloudFileStorage(
            json.loads(config.CLOUD_STORAGE_CREDENTIALS),
            config.BUCKET_NAME,
        )
        logger.info("Using google cloud file storage")
    else:
        file_storage = LocalFileStorage(config.MIDI_DIR)
        logger.info("Using local file storage")

    scrape_free_midi(file_storage)
    scrape_robs_midi_library(file_storage)
