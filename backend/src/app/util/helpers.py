from app.util.song import SongMetadata
import re


def get_metadata_from_filepath(file_path: str):
    last = file_path.split("/")[-1]

    m = re.match(r"(.*) - (.*)\.mid$", last)
    artist = "Unknown artist"
    name = "Unknown song"
    if m and m.group(1):
        artist = m.group(1)
    if m and m.group(2):
        name = m.group(2)
    return SongMetadata(artist, name)
