from common.repository.mongo_song_repository import MongoSongRepository
from common.repository.file_song_repository import FileSongRepository
from common.repository.song_repository import SongRepository
import config
import asyncio
import os
from functools import update_wrapper
from midi_scraper.midi_scraper import (
    scrape_free_midi,
    scrape_robs_midi_library,
    parse_to_db,
)
from common.util.filestorage import (
    FileStorage,
    LocalFileStorage,
    GoogleCloudFileStorage,
)
import logging
import json
import click
import shutil


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


def coro(f):
    f = asyncio.coroutine(f)

    def wrapper(*args, **kwargs):
        loop = asyncio.get_event_loop()
        return loop.run_until_complete(f(*args, **kwargs))

    return update_wrapper(wrapper, f)


@click.group()
@click.pass_context
def cli(ctx):
    ctx.ensure_object(dict)
    logger = __setup_logging()
    if config.CLOUD_STORAGE_CREDENTIALS:
        download_file_storage: FileStorage = GoogleCloudFileStorage(
            json.loads(config.CLOUD_STORAGE_CREDENTIALS),
            config.BUCKET_NAME,
            prefix=config.RAW_MIDI_PREFIX,
        )
        upload_file_storage: FileStorage = GoogleCloudFileStorage(
            json.loads(config.CLOUD_STORAGE_CREDENTIALS),
            config.BUCKET_NAME,
            prefix=config.PROCESSED_MIDI_PREFIX,
        )
        logger.info("Using google cloud file storage")
    else:
        download_file_storage = LocalFileStorage(config.MIDI_DIR)
        upload_file_storage = LocalFileStorage(
            os.path.join(config.MIDI_DIR, config.PROCESSED_MIDI_PREFIX)
        )
        logger.info("Using local file storage")
    if config.MONGODB_URL:
        repository: SongRepository = MongoSongRepository(config.MONGODB_URL)
        logger.info("Using mongo repository")
    else:
        repository = FileSongRepository(upload_file_storage)
        logger.info("Using file repository")

    download_file_storage.initialize()
    ctx.obj["download_file_storage"] = download_file_storage
    ctx.obj["repository"] = repository
    ctx.obj["logger"] = logger


@cli.command(help="Download and/or parse midi files")
@click.option(
    "--robs", is_flag=True, help="Download midi files from http://www.storth.com/midi"
)
@click.option(
    "--freemidi",
    is_flag=True,
    help="Download midi files from https://freemidi.org/topmidi",
)
@click.option(
    "--parse",
    is_flag=True,
    help="Parse downloaded midi files. "
    "Increases search speed, but takes up more space",
)
@click.pass_context
def download(ctx, robs, freemidi, parse):
    download_file_storage = ctx.obj["download_file_storage"]
    repository = ctx.obj["repository"]
    loop = asyncio.get_event_loop()
    if freemidi:
        loop.run_until_complete(scrape_free_midi(download_file_storage))
    if robs:
        loop.run_until_complete(scrape_robs_midi_library(download_file_storage))
    if parse:
        loop.run_until_complete(parse_to_db(download_file_storage, repository))
    if not parse and not robs and not freemidi:
        click.echo(ctx.get_help())


@cli.command(help="Delete downloaded midi files")
@click.pass_context
def clean(ctx):
    logger = ctx.obj["logger"]
    if type(ctx.obj["download_file_storage"]) != LocalFileStorage:
        click.echo("Cannot clean remote file storage")
        exit(1)
    path = os.path.realpath(config.MIDI_DIR)
    if click.confirm(
        "Do you want to delete all downloaded/parsed midi files?"
        f" (Following directory is going to be deleted: `{path}`)"
    ):
        logger.info(f"Deleting {path}")
        shutil.rmtree(path)


if __name__ == "__main__":
    asyncio.run(cli())
