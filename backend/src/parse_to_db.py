from app.search_engine.parser import MidiParser
from miditoolkit.midi import MidiFile
from app.search_engine.song import SongMetadata, Song
import config
import os
import pickle


def main():
    os.makedirs(config.PROCESSED_MIDI, exist_ok=True)
    for i in os.listdir(config.RAW_MIDI_DIR):
        p = os.path.join(config.RAW_MIDI_DIR, i)
        print(f"Parsing: {i}")
        mid = MidiFile(p)
        song = MidiParser.parse(mid)
        isplit = i.split(" - ")
        song.metadata = SongMetadata(isplit[0], isplit[1].replace(".mid", ""))
        with open(os.path.join(config.PROCESSED_MIDI, f"{i}.pkl"), "wb") as pf:
            pickle.dump(song, pf)


if __name__ == "__main__":
    main()
