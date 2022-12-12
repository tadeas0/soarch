import * as Tone from "tone";
import {
    DEFAULT_PIANO_ROLL_HEIGHT,
    MEASURE_LENGTH,
    MIN_MEASURES,
    PIANO_ROLL_LOWEST_NOTE,
    PIANO_ROLL_NOTE_SUBDIVISION,
} from "../constants";
import GridParams from "../interfaces/GridParams";
import RollCoordinates from "../interfaces/RollCoordinates";
// eslint-disable-next-line import/no-cycle
import { Note } from "../interfaces/Note";

export const tonePitchToRollPitch = (
    pitch: Tone.FrequencyClass,
    gridParams: GridParams
): number =>
    gridParams.height -
    (Tone.Frequency(pitch).toMidi() -
        Tone.Frequency(gridParams.lowestNote).toMidi()) -
    1;

export const toneTimeToRollTime = (time: Tone.TimeClass) => {
    const split = time.toBarsBeatsSixteenths().split(":");
    return (
        parseInt(split[0], 10) * 16 +
        parseInt(split[1], 10) * 4 +
        parseInt(split[2], 10) * 1
    );
};

export const rollTimeToToneTime = (column: number): Tone.TimeClass =>
    Tone.Time(`0:0:${(16 / PIANO_ROLL_NOTE_SUBDIVISION) * column}`);

export const rollPitchToTonePitch = (
    row: number,
    gridParams: GridParams
): Tone.FrequencyClass =>
    Tone.Frequency(gridParams.lowestNote).transpose(
        gridParams.height - row - 1
    );

export const rollCoordsToTone = (
    coords: RollCoordinates,
    gridParams: GridParams
): { pitch: Tone.FrequencyClass; time: Tone.TimeClass } => ({
    pitch: rollPitchToTonePitch(coords.row, gridParams),
    time: rollTimeToToneTime(coords.column),
});

export const toneCoordsToRoll = (
    note: {
        pitch: Tone.FrequencyClass;
        time: Tone.TimeClass;
    },
    gridParams: GridParams
): RollCoordinates => ({
    row: tonePitchToRollPitch(note.pitch, gridParams),
    column: toneTimeToRollTime(note.time),
});

export const getStartRollCoords = (
    note: Note,
    gridParams: GridParams
): RollCoordinates => ({
    row: tonePitchToRollPitch(note.pitch, gridParams),
    column: toneTimeToRollTime(note.time),
});

export const getEndRollCoords = (
    note: Note,
    gridParams: GridParams
): RollCoordinates => ({
    row: tonePitchToRollPitch(note.pitch, gridParams),
    column: toneTimeToRollTime(note.time) + toneTimeToRollTime(note.length) - 1,
});

export const getGridParamsFromNotes = (notes: Note[]): GridParams => {
    let minGridLength = 0;
    let minGridStart = toneTimeToRollTime(notes[0].time);
    const lowestNote: Tone.Unit.MidiNote = Tone.Frequency(
        PIANO_ROLL_LOWEST_NOTE
    ).toMidi();
    const highestNote =
        Tone.Frequency(PIANO_ROLL_LOWEST_NOTE).toMidi() +
        DEFAULT_PIANO_ROLL_HEIGHT -
        1;
    // let highestNote: Tone.Unit.MidiNote = 0;
    for (const n of notes) {
        const nMin = toneTimeToRollTime(n.time);
        let length = toneTimeToRollTime(n.length);
        if (length === 0) length = 1;
        const nMax = nMin + length;
        const midiPitch = n.pitch.toMidi();
        if (midiPitch < lowestNote)
            throw new Error(
                `Note ${midiPitch} is lower than minimum piano roll pitch ${lowestNote}`
            ); // TODO: move the note up by an octave, when it is too high

        if (midiPitch > highestNote)
            throw new Error(
                `Note ${midiPitch} is higher than maximum piano roll pitch ${highestNote}`
            ); // TODO: move the note down by an octave, when it is too high
        if (minGridStart > nMin) minGridStart = nMin;
        if (nMax > minGridLength) minGridLength = nMax;
    }

    const gridStart = minGridStart - (minGridStart % MEASURE_LENGTH);
    const gridEnd =
        minGridLength + MEASURE_LENGTH - (minGridLength % MEASURE_LENGTH);
    const gridWidth = Math.max(
        MIN_MEASURES * MEASURE_LENGTH,
        gridEnd - gridStart
    );
    return {
        width: gridWidth,
        height: DEFAULT_PIANO_ROLL_HEIGHT,
        lowestNote: PIANO_ROLL_LOWEST_NOTE,
    };
};
