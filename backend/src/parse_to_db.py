from app.midi.parser import Parser
from app.midi.song import Song
import config
import os
import pickle


def main():
    os.makedirs(config.PROCESSED_MIDI, exist_ok=True)
    songs = []

    for i in os.listdir(config.RAW_MIDI_DIR):
        p = os.path.join(config.RAW_MIDI_DIR, i)
        a = Parser.load_parse(p)
        isplit = i.split(" - ")
        song = Song(isplit[1].rstrip(".mid"), isplit[0], a)
        print(f"Parsing: {i}")
        with open(os.path.join(config.PROCESSED_MIDI, f"{i}.pkl"), "wb") as pf:
            pickle.dump(song, pf)


if __name__ == "__main__":
    main()
