from app.util.song import SongMetadata
import re


def get_artist_name_from_filepath(file_path: str) -> tuple[str, str]:
    last = file_path.split("/")[-1]

    m = re.match(r"(.*) - (.*)\.(mid|pkl)$", last)
    artist = "Unknown artist"
    name = "Unknown song"
    if m and m.group(1):
        artist = m.group(1)
    if m and m.group(2):
        name = m.group(2)
    return artist, name


def get_filename_from_metadata(metadata: SongMetadata, extension="pkl"):
    return f"{metadata.artist} - {metadata.name}.{extension}"


def split_list(target_list: list, n: int):
    """split list into n similarly sized chunks"""
    k, m = divmod(len(target_list), n)
    return (
        target_list[i * k + min(i, m) : (i + 1) * k + min(i + 1, m)] for i in range(n)
    )
