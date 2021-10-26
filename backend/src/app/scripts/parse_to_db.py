from app.midi.parser import MidiParser
from miditoolkit.midi import MidiFile
from app.midi.song import SongMetadata
from app import file_storage
import config
import os
import pickle
import click
from quart.cli import with_appcontext


@click.command("parse-db")
@with_appcontext
def parse_to_db():
    for i in file_storage.list_prefix(config.RAW_MIDI_PREFIX):
        click.echo(f"Parsing: {i}")
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
            click.echo(f"Could not parse {i}. {e}")
        except EOFError as e:
            click.echo(f"Could not parse {i}. {e}")
