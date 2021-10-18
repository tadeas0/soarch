from io import BytesIO
import requests
import os
from bs4 import BeautifulSoup  # type: ignore
import config
from miditoolkit.midi import MidiFile
from app.search_engine.song import Song, SongMetadata
from app.search_engine.parser import MidiParser
import pickle

URL = "https://freemidi.org/topmidi"
GETTER_URL = "https://freemidi.org/getter"


def main():
    os.makedirs(config.PROCESSED_MIDI, exist_ok=True)

    html = requests.get(f"{URL}").content
    soup = BeautifulSoup(html, features="html.parser")
    for i in soup.find_all("div", class_="song-list-container"):
        title_div = i.find("div", class_="top-mid-title")
        artist_div = i.find("div", class_="top-mid-dir")
        song_title = title_div.a["title"]
        artist = artist_div.a.contents[0]

        print(f"Processing: {artist} - {song_title}")

        download_link = f"{GETTER_URL}-{title_div.a['href'].split('-')[1]}"
        headers = {
            "Host": "freemidi.org",
            "Connection": "keep-alive",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US,en;q=0.9",
        }
        session = requests.Session()
        r1 = session.get(download_link, headers=headers)
        r2 = session.get(download_link, headers=headers)
        with open(
            os.path.join(config.RAW_MIDI_DIR, f"{artist} - {song_title}.mid"), "wb"
        ) as f:
            f.write(r2.content)


if __name__ == "__main__":
    main()
