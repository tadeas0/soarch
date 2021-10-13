import os
from midi.parser import Parser


def main():
    for i in os.listdir("../midi_files/raw"):
        print("---------------------------")
        print(i)
        Parser.load_parse(os.path.join("../midi_files/raw", i))


if __name__ == "__main__":
    main()
