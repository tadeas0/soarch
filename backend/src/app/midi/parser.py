from mido import MidiFile, merge_tracks
from mido.messages.messages import Message
import config
import numpy as np
from scipy.interpolate import interp1d
import math


class Parser:
    @staticmethod
    def __get_velocity(message: Message) -> int:
        if message.type == "note_on" and message.velocity > config.VELOCITY_THRESHOLD:
            return message.velocity

        elif message.type == "note_off" or (
            message.type == "note_on" and message.velocity <= config.VELOCITY_THRESHOLD
        ):
            return 0
        else:
            raise TypeError()

    @staticmethod
    def __downsample(array, npts):
        interpolated = interp1d(
            np.arange(len(array)),
            array,
            axis=0,
            kind="nearest",
            fill_value="extrapolate",
        )
        downsampled = interpolated(np.linspace(0, len(array), npts))
        return downsampled

    @staticmethod
    def load_parse(midi_file_path: str):
        mid = MidiFile(midi_file_path)
        return Parser.parse(mid)

    @staticmethod
    def parse(midi_file: MidiFile):
        """Parses MidiFile to np.ndarray. Returns 2D array of channels containing sequences of notes.

        Args:
            midi_file (MidiFile): MIDI file

        Returns:
            np.ndarray: array[MIDI channels][notes]
        """
        assert (
            midi_file.type != 2
        )  # Parser doesn't handle Type 2 MIDI files TODO: Create exception

        track = merge_tracks(midi_file.tracks)
        track_length = sum(i.time for i in track)

        ret_tracks = np.zeros((config.MIDI_CHANNELS, track_length), dtype=np.int8)
        velocity_matrix = np.zeros(
            (config.MIDI_CHANNELS, config.MIDI_NOTES), dtype=np.int8
        )

        current_time = 0
        for message in track:
            if message.type == "note_on" or message.type == "note_off" and current_time:
                for c in range(config.MIDI_CHANNELS):
                    non_zero = np.nonzero(velocity_matrix[c])
                    if len(non_zero[0]) > 0:
                        ret_tracks[c][
                            current_time : current_time + message.time
                        ] = non_zero[0][-1]
                vel = Parser.__get_velocity(message)
                velocity_matrix[message.channel][message.note] = vel
            current_time += message.time

        ###################################################################
        # TODO: I dont know if it works
        # Resample tracks from ticks to 64th notes
        notes = math.floor((track_length / midi_file.ticks_per_beat) * 16)
        new_res_tracks = np.ndarray((config.MIDI_CHANNELS, notes))
        for i in range(config.MIDI_CHANNELS):
            new_res_tracks[i] = Parser.__downsample(ret_tracks[i], notes)

        ###################################################################

        return new_res_tracks
