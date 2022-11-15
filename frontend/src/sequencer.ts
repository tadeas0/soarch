import * as Tone from "tone";
import {
    MEASURE_LENGTH,
    PIANO_ROLL_LOWEST_NOTE,
    PIANO_ROLL_NOTE_SUBDIVISION,
} from "./constants";
import GridParams from "./interfaces/GridParams";

export interface Note {
    time: Tone.Unit.Time;
    pitch: Tone.Unit.Note;
    length: Tone.Unit.Time;
}

export abstract class Sequencer {
    private static filter: Tone.Filter = new Tone.Filter(
        400,
        "lowpass"
    ).toDestination();
    private static synth: Tone.PolySynth | Tone.Synth = new Tone.PolySynth(
        Tone.Synth,
        {
            envelope: {
                attack: 0.005,
                attackCurve: "linear",
                decay: 0.1,
                decayCurve: "exponential",
                release: 1,
                releaseCurve: "exponential",
                sustain: 0.3,
            },
            oscillator: {
                partialCount: 0,
                phase: 0,
                type: "sawtooth",
            },
        }
    ).connect(this.filter);

    private static part: Tone.Part = new Tone.Part();

    private static onBeatCallbacks: (() => void)[] = [];

    private static onMeasureCallbacks: (() => void)[] = [];

    public static async init() {
        await Tone.start();
    }

    public static fillBuffer(notes: Note[], gridLength: number) {
        this.part = new Tone.Part((time, note) => {
            this.synth.triggerAttackRelease(note.pitch, note.length, time);
        }, notes).start(0);

        Tone.Transport.setLoopPoints(0, this.rollTimeToToneTime(gridLength));

        Tone.Transport.loop = true;
    }

    public static addNoteToBuffer(note: Note) {
        this.part.add(note.time, note);
    }

    public static deleteNoteFromBuffer(note: Note) {
        this.part.remove(note.time, note);
    }

    public static getGridParamsFromNotes(notes: Note[]): GridParams {
        let minGridLength = 0;
        let minGridStart = this.toneTimeToRollTime(notes[0].time);
        let lowestNote: Tone.Unit.MidiNote = Tone.Frequency(
            notes[0].pitch
        ).toMidi();
        let highestNote: Tone.Unit.MidiNote = 0;
        for (const n of notes) {
            const nMin = this.toneTimeToRollTime(n.time);
            let length = this.toneTimeToRollTime(n.length);
            if (length === 0) length = 1;
            const nMax = nMin + length;
            const midiPitch = Tone.Frequency(n.pitch).toMidi();
            if (midiPitch < lowestNote) lowestNote = midiPitch;
            if (midiPitch > highestNote) highestNote = midiPitch;
            if (minGridStart > nMin) minGridStart = nMin;
            if (nMax > minGridLength) minGridLength = nMax;
        }

        const lowC = lowestNote - (lowestNote % 12);
        const highB = highestNote + 12 - (highestNote % 12) - 1;
        const gridStart = minGridStart - (minGridStart % MEASURE_LENGTH);
        const gridEnd =
            minGridLength + MEASURE_LENGTH - (minGridLength % MEASURE_LENGTH);
        const gridWidth = gridEnd - gridStart;
        const gridHeight = highB - lowC + 1;

        return {
            width: gridWidth,
            height: gridHeight,
            lowestNote: Tone.Frequency(lowC, "midi").toNote(),
        };
    }

    public static clearBuffer() {
        Tone.Transport.cancel();
    }

    public static setBpm(bpm: number) {
        Tone.Transport.bpm.value = bpm;
    }

    public static setSynth(synth: Tone.Synth) {
        this.synth = synth;
    }

    public static getSynth() {
        return this.synth;
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
            parseInt(split[0]) * 16 +
            parseInt(split[1]) * 4 +
            parseInt(split[2]) * 1
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

    public static isPlaying() {
        return Tone.Transport.state === "started";
    }

    public static start() {
        Tone.Transport.start();
        Tone.Transport.scheduleRepeat((time) => {
            this.onBeatCallbacks.forEach((c) => {
                Tone.Draw.schedule(() => {
                    c();
                }, time);
            });
        }, "16n");

        Tone.Transport.scheduleRepeat((time) => {
            this.onMeasureCallbacks.forEach((c) => {
                Tone.Draw.schedule(() => {
                    c();
                }, time);
            });
        }, "2n");
    }

    public static stop() {
        if (this.synth instanceof Tone.Synth) this.synth.triggerRelease();
        else if (this.synth instanceof Tone.PolySynth) this.synth.releaseAll();
        Tone.Transport.stop();
    }

    public static isInitialized() {
        return Tone.context.state === "running";
    }

    public static async runCallbackOnBeat(callback: () => void) {
        this.onBeatCallbacks.push(callback);
    }

    public static async runCallbackOnMeasure(callback: () => void) {
        this.onMeasureCallbacks.push(callback);
    }

    public static pressNote(note: Tone.Unit.Frequency) {
        this.synth.triggerAttack(note, Tone.context.currentTime);
    }

    public static releaseNote(note: Tone.Unit.Frequency) {
        this.synth.triggerRelease(note, Tone.context.currentTime);
    }
}
