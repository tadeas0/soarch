import requests
import os
from bs4 import BeautifulSoup
import config
import click
from app import file_storage
from quart.cli import with_appcontext


@click.command("scrape-rob")
@with_appcontext
def scrape_robs_library():
    html = requests.get(f"{config.ROBS_MIDI_LIB_URL}/music-b.htm").content
    soup = BeautifulSoup(html, features="html.parser")
    for i in soup.body.find_all("table")[1].find_all("a"):
        if i.string and i.string != " ":
            full_name = i.string.replace("\n", " ").replace("\r", "").strip()
            full_name_split = full_name.split(" - ")
            artist = full_name_split[0]
            song = full_name_split[1]
            midi_file_link = f"{config.ROBS_MIDI_LIB_URL}/{i.get('href')}"
            click.echo(f"Downloading {artist} - {song}")
            with file_storage.open(
                os.path.join(config.RAW_MIDI_PREFIX, f"{artist} - {song}.mid"), "wb"
            ) as midi_file:
                res = requests.get(midi_file_link, allow_redirects=True)
                midi_file.write(res.content)
