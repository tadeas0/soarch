import json
from pymongo.errors import InvalidOperation
from datetime import datetime
from logging import Logger
from common.repository.mongo_song_repository import MongoSongRepository
from common.util.filestorage.filestorage import FileStorage
from common.util.filestorage.google_cloud_filestorage import GoogleCloudFileStorage
from common.util.filestorage.local_file_storage import LocalFileStorage
from midi_scraper.midi_scraper import parse_to_db, tag_with_spotify_data
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import asyncio
import common.config as config
from common.util.logging import setup_logging


async def run_job(logger: Logger):
    logger.info("Starting parsing cron job")
    if config.CLOUD_STORAGE_CREDENTIALS and config.BUCKET_NAME:
        logger.info("Using google cloud storage")
        download_file_storage: FileStorage = GoogleCloudFileStorage(
            json.loads(config.CLOUD_STORAGE_CREDENTIALS),
            config.BUCKET_NAME,
            prefix=config.RAW_MIDI_PREFIX,
        )
    else:
        logger.info("Using local file storage")
        download_file_storage = LocalFileStorage(config.MIDI_DIR)
    if not config.MONGODB_URL:
        raise ValueError("Missing mongo db url")

    song_repo = MongoSongRepository(config.MONGODB_URL)
    try:
        await parse_to_db(download_file_storage, song_repo)
        logger.info("Parsing finished")
    except InvalidOperation as e:
        logger.info(e)
    if config.SPOTIFY_CLIENT_ID and config.SPOTIFY_CLIENT_SECRET:
        await tag_with_spotify_data(song_repo)
        logger.info("Fetching spotify metadata finished")
    logger.info("Job finished")


if __name__ == "__main__":
    logger = setup_logging()
    scheduler = AsyncIOScheduler(logger=logger)
    scheduler.add_job(
        run_job, "interval", hours=1, args=(logger,), next_run_time=datetime.now()
    )
    scheduler.start()
    asyncio.get_event_loop().run_forever()
