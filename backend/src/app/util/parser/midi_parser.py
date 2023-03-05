from miditoolkit.midi import MidiFile
from app.util.song import Song, SongMetadata, Track, Note
from app.util.parser.helpers import scale_ticks
import config


class MidiParser:
    @staticmethod
    def parse(midi_file: MidiFile, artist: str, name: str) -> Song:
        melodic_inst = filter(lambda inst: not inst.is_drum, midi_file.instruments)

        def st(t: int):
            return scale_ticks(midi_file.ticks_per_beat, config.DEFAULT_PPQ, t)

        bpm = 120
        for i in map(lambda c: c.tempo, midi_file.tempo_changes):
            if i > 0:
                bpm = i
                break

        return Song(
            [
                Track(
                    list(
                        map(
                            lambda n: Note(
                                st(n.start), st(n.end) - st(n.start), n.pitch
                            ),
                            inst.notes,
                        )
                    ),
                    st(midi_file.max_tick),
                )
                for inst in melodic_inst
            ],
            bpm,
            SongMetadata(artist, name),
        )
