import requests
import os
from bs4 import BeautifulSoup  # type: ignore
import config
import click
from flask.cli import with_appcontext

TOPMIDI_URL = "https://freemidi.org/topmidi"
GETTER_URL = "https://freemidi.org/getter"


@click.command("scrape-freemidi")
@with_appcontext
def scrape_freemidi():
    os.makedirs(config.PROCESSED_MIDI, exist_ok=True)

    html = requests.get(f"{TOPMIDI_URL}").content
    soup = BeautifulSoup(html, features="html.parser")
    for i in soup.find_all("div", class_="song-list-container"):
        title_div = i.find("div", class_="top-mid-title")
        artist_div = i.find("div", class_="top-mid-dir")
        song_title = title_div.a["title"]
        artist = artist_div.a.contents[0]

        click.echo(f"Downloading: {artist} - {song_title}")

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
