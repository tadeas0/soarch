from app.search_engine.parser import MidiParser
from miditoolkit.midi import MidiFile
from app.midi.song import Song
import config
import os
import pickle


def main():
    os.makedirs(config.PROCESSED_MIDI, exist_ok=True)
    for i in os.listdir(config.RAW_MIDI_DIR):
        p = os.path.join(config.RAW_MIDI_DIR, i)
        mid = MidiFile(p)
        a = MidiParser.parse(mid)
        isplit = i.split(" - ")
        song = Song(isplit[1].rstrip(".mid"), isplit[0], a)
        print(f"Parsing: {i}")
        with open(os.path.join(config.PROCESSED_MIDI, f"{i}.pkl"), "wb") as pf:
            pickle.dump(song, pf)


if __name__ == "__main__":
    main()
