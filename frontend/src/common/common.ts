import { MAX_POLYPHONY } from "../constants";
import { SynthPreset } from "../sound/synthPresets";
import * as Tone from "tone";
import { Note } from "../interfaces/Note";
import { NoteSerialized } from "../interfaces/NoteSerialized";
import { SearchResult } from "../interfaces/SearchResult";
import { Song } from "../interfaces/Song";
import { SongParams } from "../interfaces/SongParams";
import { SongParamsSerialized } from "../interfaces/SongParamsSerialized";
import GridParams from "../interfaces/GridParams";
import { GridParamsSerialized } from "../interfaces/GridParamsSerialized";

export const clamp = (n: number, min: number, max: number) =>
    Math.min(Math.max(n, min), max);

export const getSynthFromPreset = (preset: SynthPreset) => {
    let newSynth = preset.preset;
    if (newSynth instanceof Tone.PolySynth) {
        newSynth.maxPolyphony = MAX_POLYPHONY;
    }
    if (preset.filter !== undefined) {
        const newFilter = preset.filter;
        newSynth = newSynth.connect(newFilter);
        newFilter.toDestination();
    } else {
        newSynth.toDestination();
    }
    return newSynth;
};

export const serializeNote = (note: Note): NoteSerialized => ({
    pitch: note.pitch.toMidi(),
    length: note.length.toBarsBeatsSixteenths(),
    time: note.time.toBarsBeatsSixteenths(),
});

export const deserializeNote = (note: NoteSerialized) => ({
    time: Tone.Time(note.time),
    pitch: Tone.Frequency(note.pitch, "midi"),
    length: Tone.Time(note.length),
});

export const serializeGridParams = (
    gridParams: GridParams
): GridParamsSerialized => ({
    height: gridParams.height,
    lowestNote: Tone.Frequency(gridParams.lowestNote).toMidi(),
    width: gridParams.width,
});

export const serializeSongParams = (
    song: SongParams
): SongParamsSerialized => ({
    bpm: song.bpm,
    gridParams: serializeGridParams(song.gridParams),
    name: song.name,
    notes: song.notes.map(serializeNote),
});

export const deserializeGridParams = (
    gridParams: GridParamsSerialized
): GridParams => ({
    height: gridParams.height,
    width: gridParams.width,
    lowestNote: Tone.Midi(gridParams.lowestNote).toNote(),
});

export const deserializeSongParams = (
    song: SongParamsSerialized
): SongParams => ({
    bpm: song.bpm,
    gridParams: deserializeGridParams(song.gridParams),
    name: song.name,
    notes: song.notes.map(deserializeNote),
});
