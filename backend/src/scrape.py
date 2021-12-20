import config
import asyncio
import os
from functools import update_wrapper
from midi_scraper.midi_scraper import (
    scrape_free_midi,
    scrape_robs_midi_library,
    parse_to_db,
)
from app.util.filestorage import FileStorage, LocalFileStorage, GoogleCloudFileStorage
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
        file_storage: FileStorage = GoogleCloudFileStorage(
            json.loads(config.CLOUD_STORAGE_CREDENTIALS),
            config.BUCKET_NAME,
        )
        logger.info("Using google cloud file storage")
    else:
        file_storage = LocalFileStorage(config.MIDI_DIR)
        logger.info("Using local file storage")
    loop = asyncio.get_event_loop()
    loop.run_until_complete(file_storage.initialize())
    ctx.obj["file_storage"] = file_storage
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
    file_storage = ctx.obj["file_storage"]
    loop = asyncio.get_event_loop()
    if freemidi:
        loop.run_until_complete(scrape_free_midi(file_storage))
    if robs:
        loop.run_until_complete(scrape_robs_midi_library(file_storage))
    if parse:
        loop.run_until_complete(parse_to_db(file_storage))
    if not parse and not robs and not freemidi:
        click.echo(ctx.get_help())


@cli.command(help="Delete downloaded midi files")
@click.pass_context
def clean(ctx):
    logger = ctx.obj["logger"]
    if type(ctx.obj["file_storage"]) != LocalFileStorage:
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
