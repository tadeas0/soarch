import asyncio
import itertools
from typing import AsyncIterable
from aiohttp import ClientSession
import logging
import io
import os
from miditoolkit.midi import MidiFile
from app.util.filestorage import FileStorage
from common.entity.song import Song
from app.util.parser import MidiParser
from bs4 import BeautifulSoup
from app.repository.song_repository import SongRepository
import config
from app.util.helpers import get_artist_name_from_filepath

FREEMIDI_URL = "https://freemidi.org/topmidi"
FREEMIDI_GETTER_URL = "https://freemidi.org/getter"
ROBS_MIDI_LIB_URL = "http://www.storth.com/midi"

logger = logging.getLogger(config.SCRAPER_LOGGER)


async def __download(
    file_storage: FileStorage,
    url: str,
    file_name: str,
    session: ClientSession,
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
    logger.info("Scraping Rob's midi library")
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
                    os.path.join(config.ROBS_PREFIX, f"{name}.mid"),
                    session,
                )
                for name, link in links
            ]
        )
    logger.info("Finished scraping Rob's midi library")


async def __fetch_freemidi_links(link: str, session: ClientSession):
    res = []
    logger.info("Scraping FreeMidi library")
    html = await (await session.get(link)).text()
    soup = BeautifulSoup(html, features="html.parser")
    for i in soup.find_all("div", class_="song-list-container"):
        title_div = i.find("div", class_="top-mid-title")
        artist_div = i.find("div", class_="top-mid-dir")
        song_title = title_div.a["title"]
        artist = artist_div.a.contents[0]
        download_link = f"{FREEMIDI_GETTER_URL}-{title_div.a['href'].split('-')[1]}"
        full_name = f"{artist} - {song_title}"
        res.append((full_name, download_link))
    return res


async def scrape_free_midi(file_storage: FileStorage):
    logger.info("Scraping FreeMidi library")
    headers = {
        "Host": "freemidi.org",
        "Connection": "keep-alive",
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36"
        ),
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-US,en;q=0.9",
    }
    async with ClientSession(headers=headers) as session:
        links = await __fetch_freemidi_links(FREEMIDI_URL, session)

        async def double_download(url: str, fullname: str):
            await __download(
                file_storage,
                url,
                os.path.join(config.FREEMIDI_PREFIX, fullname + ".mid"),
                session,
            )
            await __download(
                file_storage,
                url,
                os.path.join(config.FREEMIDI_PREFIX, fullname + ".mid"),
                session,
            )

        await asyncio.gather(*[double_download(i[1], i[0]) for i in links])
    logger.info("Finished scraping FreeMidi library")


async def list_raw_songs(file_storage: FileStorage) -> AsyncIterable[Song]:
    for i in file_storage.list_all():
        try:
            mid = MidiFile(file=io.BytesIO(await file_storage.read(i)))
            artist, name = get_artist_name_from_filepath(i)
            song = MidiParser.parse(mid, artist, name)
            yield song
        except Exception as e:
            logger.info(f"Could not parse {i}. {e}")


async def parse_to_db(file_storage: FileStorage, repository: SongRepository):
    logger.info("Parsing files")
    await repository.insert_many([i async for i in list_raw_songs(file_storage)])
