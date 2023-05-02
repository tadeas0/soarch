import asyncio
from common import config
from common.util.filestorage.local_file_storage import LocalFileStorage
from common.repository.file_song_repository import FileSongRepository
from common.util.logging import setup_logging
from lab.search_engine_benchmark import benchmark_search_engine
from midi_scraper.midi_scraper import parse_to_db
import logging
import os

logger = logging.getLogger(config.DEFAULT_LOGGER)


async def preprocess_files():
    rp = os.path.join(config.MIDI_DIR)
    fs = LocalFileStorage(rp)
    p = os.path.join(config.MIDI_DIR, config.PROCESSED_MIDI_PREFIX)
    repo = FileSongRepository(LocalFileStorage(p))
    await parse_to_db(fs, repo)


if __name__ == "__main__":
    setup_logging()
    logger.info("Preprocessing dataset")
    asyncio.run(preprocess_files())
    logger.info("Running benchmark")
    logger.info(f"Saving results to {os.path.abspath(config.ANALYSIS_OUTPUT_DIR)}")
    asyncio.run(benchmark_search_engine())
