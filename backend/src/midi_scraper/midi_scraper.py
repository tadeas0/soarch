import logging
import pickle
from miditoolkit.midi import MidiFile
import requests
from app.midi.filestorage import FileStorage
from app.midi.song import SongMetadata
from app.midi.parser import MidiParser
import os
from bs4 import BeautifulSoup
import config

FREMIDI_URL = "https://freemidi.org/topmidi"
FREEMIDI_GETTER_URL = "https://freemidi.org/getter"
ROBS_MIDI_LIB_URL = "http://www.storth.com/midi"

logger = logging.getLogger(config.SCRAPER_LOGGER)


def scrape_robs_midi_library(file_storage: FileStorage):
    logger.info(f"Scraping Rob's midi library to {config.RAW_MIDI_PREFIX}")
    html = requests.get(f"{ROBS_MIDI_LIB_URL}/music-b.htm").content
    soup = BeautifulSoup(html, features="html.parser")
    for i in soup.body.find_all("table")[1].find_all("a"):
        if i.string and i.string != " ":
            full_name = i.string.replace("\n", " ").replace("\r", "").strip()
            full_name_split = full_name.split(" - ")
            artist = full_name_split[0]
            song = full_name_split[1]
            midi_file_link = f"{ROBS_MIDI_LIB_URL}/{i.get('href')}"
            logger.info(f"Downloading {artist} - {song}")
            with file_storage.open(
                os.path.join(config.RAW_MIDI_PREFIX, f"{artist} - {song}.mid"), "wb"
            ) as midi_file:
                res = requests.get(midi_file_link, allow_redirects=True)
                midi_file.write(res.content)
    logging.info("Finished scraping Rob's midi library to {config.RAW_MIDI_PREFIX}")


def scrape_free_midi(file_storage: FileStorage):
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
        with file_storage.open(
            os.path.join(config.RAW_MIDI_PREFIX, f"{artist} - {song_title}.mid"), "wb"
        ) as f:
            f.write(r2.content)
    logging.info("Finished scraping FreeMidi library to {config.RAW_MIDI_PREFIX}")


def parse_to_db(file_storage: FileStorage):
    logger.info(
        f"Parsing files from {config.RAW_MIDI_PREFIX} to {config.PROCESSED_MIDI_PREFIX}"
    )
    for i in file_storage.list_prefix(config.RAW_MIDI_PREFIX):
        logger.info(f"Parsing: {i}")
        try:
            mf = file_storage.open(i, "rb")
            mid = MidiFile(file=mf)
            mf.close()
            song = MidiParser.parse(mid)
            iclean = i.split("/")[-1].replace(".mid", "")
            isplit = iclean.split(" - ")
            song.metadata = SongMetadata(isplit[0], isplit[1])
            with file_storage.open(
                os.path.join(config.PROCESSED_MIDI_PREFIX, f"{iclean}.pkl"), "wb"
            ) as pf:
                pickle.dump(song, pf)
        except IOError as e:
            logger.info(f"Could not parse {i}. {e}")
        except EOFError as e:
            logger.info(f"Could not parse {i}. {e}")
