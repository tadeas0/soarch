from app.search_engine.parser import MidiParser
from miditoolkit.midi import MidiFile
from app.search_engine.song import SongMetadata, Song
import config
import os
import pickle
import click
from flask.cli import with_appcontext


@click.command("parse-db")
@with_appcontext
def parse_to_db():
    os.makedirs(config.PROCESSED_MIDI, exist_ok=True)
    for i in os.listdir(config.RAW_MIDI_DIR):
        p = os.path.join(config.RAW_MIDI_DIR, i)
        click.echo(f"Parsing: {i}")
        try:
            mid = MidiFile(p)
            song = MidiParser.parse(mid)
        except IOError as e:

            click.echo(f"Could not parse {i}. {e}")
        isplit = i.split(" - ")
        song.metadata = SongMetadata(isplit[0], isplit[1].replace(".mid", ""))
        with open(os.path.join(config.PROCESSED_MIDI, f"{i}.pkl"), "wb") as pf:
            pickle.dump(song, pf)
