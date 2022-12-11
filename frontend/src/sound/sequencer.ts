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
import { SYNTH_PRESETS } from "./synthPresets";
import { saveAs } from "file-saver";

export interface Note {
    time: Tone.Unit.Time;
    pitch: Tone.Unit.Note;
    length: Tone.Unit.Time;
}

type SequencerSynth = Tone.PolySynth | Tone.Synth | Tone.Sampler;

export abstract class Sequencer {
    public static async init() {
        await Tone.start();
    }

    public static getSynthPresets() {
        return SYNTH_PRESETS;
    }

    public static getStartCoords(
        note: Note,
        gridParams: GridParams
    ): RollCoordinates {
        return {
            row: this.tonePitchToRollPitch(
                note.pitch,
                gridParams.lowestNote,
                gridParams.height
            ),
            column: this.toneTimeToRollTime(note.time),
        };
    }

    public static getEndCoords(
        note: Note,
        gridParams: GridParams
    ): RollCoordinates {
        return {
            row: this.tonePitchToRollPitch(
                note.pitch,
                gridParams.lowestNote,
                gridParams.height
            ),
            column:
                this.toneTimeToRollTime(note.time) +
                this.toneTimeToRollTime(note.length) -
                1,
        };
    }

    public static getGridParamsFromNotes(notes: Note[]): GridParams {
        let minGridLength = 0;
        let minGridStart = this.toneTimeToRollTime(notes[0].time);
        const lowestNote: Tone.Unit.MidiNote = Tone.Frequency(
            PIANO_ROLL_LOWEST_NOTE
        ).toMidi();
        const highestNote =
            Tone.Frequency(PIANO_ROLL_LOWEST_NOTE).toMidi() +
            DEFAULT_PIANO_ROLL_HEIGHT -
            1;
        // let highestNote: Tone.Unit.MidiNote = 0;
        for (const n of notes) {
            const nMin = this.toneTimeToRollTime(n.time);
            let length = this.toneTimeToRollTime(n.length);
            if (length === 0) length = 1;
            const nMax = nMin + length;
            const midiPitch = Tone.Frequency(n.pitch).toMidi();
            if (midiPitch < lowestNote)
                throw new Error("Note is lower than minimum piano roll pitch"); // TODO: move the note up by an octave, when it is too high

            if (midiPitch > highestNote)
                throw new Error("Note is higher than maximum piano roll pitch"); // TODO: move the note down by an octave, when it is too high
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
    }

    public static createNoteObject(
        noteStart: number,
        noteLength: number,
        notePitch: number
    ): Note {
        return {
            time: this.rollTimeToToneTime(noteStart),
            pitch: Tone.Frequency(PIANO_ROLL_LOWEST_NOTE)
                .transpose(notePitch)
                .toNote(),
            length: this.rollTimeToToneTime(noteLength),
        };
    }

    public static rollTimeToToneTime(time: number) {
        return Tone.Time(
            `0:0:${(16 / PIANO_ROLL_NOTE_SUBDIVISION) * time}`
        ).toBarsBeatsSixteenths();
    }

    public static toneTimeToRollTime(time: Tone.Unit.Time) {
        const split = Tone.Time(time).toBarsBeatsSixteenths().split(":");
        return (
            parseInt(split[0], 10) * 16 +
            parseInt(split[1], 10) * 4 +
            parseInt(split[2], 10) * 1
        );
    }

    public static tonePitchToRollPitch(
        pitch: Tone.Unit.Note,
        lowestNote: Tone.Unit.Note,
        gridHeight: number
    ) {
        return (
            gridHeight -
            (Tone.Frequency(pitch).toMidi() -
                Tone.Frequency(lowestNote).toMidi()) -
            1
        );
    }

    public static rollPitchToTonePitch(pitch: number, gridParams: GridParams) {
        return Tone.Frequency(gridParams.lowestNote)
            .transpose(gridParams.height - pitch)
            .toNote();
    }

    public static isInitialized() {
        return Tone.context.state === "running";
    }

    public static async saveToFile(
        notes: Note[],
        bpm: number,
        gridLength: number,
        filename: string,
        synth: SequencerSynth
    ) {
        if (!this.isInitialized()) {
            await this.init();
        }
        Tone.Transport.cancel();
        Tone.Transport.stop();

        new Tone.Part((time, note) => {
            synth.triggerAttackRelease(note.pitch, note.length, time);
        }, notes).start(0);
        Tone.Transport.setLoopPoints(0, this.rollTimeToToneTime(gridLength));
        Tone.Transport.loop = false;
        Tone.Transport.bpm.value = bpm;
        const recorder = new Tone.Recorder();
        synth.disconnect();
        synth.connect(recorder);
        const p = new Promise<Blob>((resolve) => {
            Tone.Transport.scheduleOnce(() => {
                resolve(recorder.stop());
            }, this.rollTimeToToneTime(gridLength));
        });
        await recorder.start();
        Tone.Transport.start();
        saveAs(await p, filename);
        synth.toDestination();
    }
}
