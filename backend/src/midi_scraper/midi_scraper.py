import asyncio
import itertools
from aiohttp import ClientSession
import logging
import io
import pickle
from miditoolkit.midi import MidiFile
import requests
from app.util.filestorage import FileStorage
from app.util.song import SongMetadata
from app.util.parser import MidiParser
import os
from bs4 import BeautifulSoup
import config

FREMIDI_URL = "https://freemidi.org/topmidi"
FREEMIDI_GETTER_URL = "https://freemidi.org/getter"
ROBS_MIDI_LIB_URL = "http://www.storth.com/midi"

logger = logging.getLogger(config.SCRAPER_LOGGER)


async def __download(
    file_storage: FileStorage, url: str, file_name: str, session: ClientSession
):
    logger.info(f"Downloading: {url} to {file_name}")
    res = await session.get(url, allow_redirects=True)
    await file_storage.write(file_name, await res.read())


async def __fetch_robs_links(letter: str, session: ClientSession):
    res = []
    resp = await session.get(f"{ROBS_MIDI_LIB_URL}/music-{letter}.htm")
    html = await resp.text()
    soup = BeautifulSoup(html, features="html.parser")
    if not soup.body:
        raise RuntimeError()
    for i in soup.body.find_all("table")[1].find_all("a"):
        if i.string and i.string != " ":
            full_name = i.string.replace("\n", " ").replace("\r", "").strip()
            full_name = " ".join(full_name.split())
            midi_file_link = f"{ROBS_MIDI_LIB_URL}/{i.get('href')}"
            res.append((full_name, midi_file_link))
    return res


async def scrape_robs_midi_library(file_storage: FileStorage):
    logger.info(f"Scraping Rob's midi library to {config.RAW_MIDI_PREFIX}")
    links: list[tuple[str, str]]
    async with ClientSession() as session:
        links_nest = await asyncio.gather(
            *[
                __fetch_robs_links(chr(i), session)
                for i in range(ord("a"), ord("z") + 1)
            ]
        )
        links = list(itertools.chain.from_iterable(links_nest))
        await asyncio.gather(
            *[
                __download(
                    file_storage,
                    link,
                    os.path.join(config.RAW_MIDI_PREFIX, f"{name}.mid"),
                    session,
                )
                for name, link in links
            ]
        )
    logger.info(f"Finished scraping Rob's midi library to {config.RAW_MIDI_PREFIX}")


async def scrape_free_midi(file_storage: FileStorage):
    logger.info(f"Scraping FreeMidi library to {config.RAW_MIDI_PREFIX}")
    html = requests.get(f"{FREMIDI_URL}").content
    soup = BeautifulSoup(html, features="html.parser")
    for i in soup.find_all("div", class_="song-list-container"):
        title_div = i.find("div", class_="top-mid-title")
        artist_div = i.find("div", class_="top-mid-dir")
        song_title = title_div.a["title"]
        artist = artist_div.a.contents[0]

        logger.info(f"Downloading: {artist} - {song_title}")

        download_link = f"{FREEMIDI_GETTER_URL}-{title_div.a['href'].split('-')[1]}"
        headers = {
            "Host": "freemidi.org",
            "Connection": "keep-alive",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US,en;q=0.9",
        }
        session = requests.Session()
        session.get(download_link, headers=headers)
        r2 = session.get(download_link, headers=headers)
        await file_storage.write(
            os.path.join(config.RAW_MIDI_PREFIX, f"{artist} - {song_title}.mid"),
            r2.content,
        )
    logger.info("Finished scraping FreeMidi library to {config.RAW_MIDI_PREFIX}")


async def parse_to_db(file_storage: FileStorage):
    logger.info(
        f"Parsing files from {config.RAW_MIDI_PREFIX} to {config.PROCESSED_MIDI_PREFIX}"
    )
    for i in file_storage.list_prefix(config.RAW_MIDI_PREFIX):
        logger.info(f"Parsing: {i}")
        try:
            mid = MidiFile(file=io.BytesIO(await file_storage.read(i)))
            song = MidiParser.parse(mid)
            iclean = i.split("/")[-1].replace(".mid", "")
            isplit = iclean.split(" - ")
            song.metadata = SongMetadata(isplit[0], isplit[1])
            await file_storage.write(
                os.path.join(config.PROCESSED_MIDI_PREFIX, f"{iclean}.pkl"),
                pickle.dumps(song),
            )
        except Exception as e:
            logger.info(f"Could not parse {i}. {e}")
