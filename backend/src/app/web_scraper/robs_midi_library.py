import requests
import os
from bs4 import BeautifulSoup  # type: ignore
import config


def main():
    os.makedirs(config.RAW_MIDI_DIR, exist_ok=True)

    html = requests.get(f"{config.ROBS_MIDI_LIB_URL}/music-b.htm").content
    soup = BeautifulSoup(html, features="html.parser")
    for i in soup.body.find_all("table")[1].find_all("a"):
        if i.string and i.string != " ":
            full_name = i.string.replace("\n", " ").replace("\r", "").strip()
            full_name_split = full_name.split(" - ")
            artist = full_name_split[0]
            song = full_name_split[1]
            midi_file_link = f"{config.ROBS_MIDI_LIB_URL}/{i.get('href')}"
            print(f"Downloading {artist} - {song}")
            with open(
                os.path.join(config.RAW_MIDI_DIR, f"{artist} - {song}.mid"), "wb"
            ) as midi_file:
                res = requests.get(midi_file_link, allow_redirects=True)
                midi_file.write(res.content)


if __name__ == "__main__":
    main()
