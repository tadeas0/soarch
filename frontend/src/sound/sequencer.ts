import * as Tone from "tone";
import {
    DEFAULT_PIANO_ROLL_HEIGHT,
    MAX_POLYPHONY,
    MEASURE_LENGTH,
    PIANO_ROLL_LOWEST_NOTE,
    PIANO_ROLL_NOTE_SUBDIVISION,
} from "../constants";
import GridParams from "../interfaces/GridParams";
import RollCoordinates from "../interfaces/RollCoordinates";
import { SynthPreset, SYNTH_PRESETS } from "./synthPresets";
import { saveAs } from "file-saver";

export interface Note {
    time: Tone.Unit.Time;
    pitch: Tone.Unit.Note;
    length: Tone.Unit.Time;
}

type SequencerSynth = Tone.PolySynth | Tone.Synth | Tone.Sampler;

export abstract class Sequencer {
    private static synth: SequencerSynth =
        SYNTH_PRESETS[0].preset.toDestination();

    private static metronomeSampler: Tone.Sampler = new Tone.Sampler({
        urls: {
            G4: "/samples/metronome_down.mp3",
            C4: "/samples/metronome_up.mp3",
        },
        release: 1,
        volume: -100,
    }).toDestination();

    private static part: Tone.Part = new Tone.Part();

    private static metronomePart: Tone.Part = new Tone.Part();

    private static onBeatCallbacks: (() => void)[] = [];

    private static onMeasureCallbacks: (() => void)[] = [];

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

    public static getMetronomeEnabled() {
        return this.metronomeSampler.volume.value === 0;
    }

    public static enableMetronome() {
        this.metronomeSampler.volume.value = 0;
    }

    public static disableMetronome() {
        this.metronomeSampler.volume.value = -100;
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

    public static fillBuffer(notes: Note[], gridLength: number) {
        this.part = new Tone.Part((time, note) => {
            this.synth.triggerAttackRelease(note.pitch, note.length, time);
        }, notes).start(0);

        Tone.Transport.setLoopPoints(0, this.rollTimeToToneTime(gridLength));

        Tone.Transport.loop = true;
    }

    public static fillMetronome(gridLength: number) {
        const metronomeNotes = [];
        for (let i = 0; i < gridLength / 2; i++) {
            const pitch = i % 4 === 0 ? "G4" : "C4";
            metronomeNotes.push({ time: `0:${i}:0`, pitch: pitch });
        }

        this.metronomePart = new Tone.Part((time, note) => {
            this.metronomeSampler.triggerAttackRelease(
                note.pitch,
                "0:0:1",
                time
            );
        }, metronomeNotes).start(0);
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
            PIANO_ROLL_LOWEST_NOTE
        ).toMidi();
        let highestNote =
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
        const gridWidth = gridEnd - gridStart;

        return {
            width: gridWidth,
            height: DEFAULT_PIANO_ROLL_HEIGHT,
            lowestNote: PIANO_ROLL_LOWEST_NOTE,
        };
    }

    public static clearBuffer() {
        Tone.Transport.cancel();
    }

    public static setBpm(bpm: number) {
        Tone.Transport.bpm.value = bpm;
    }

    public static setSynthPreset(synth: SynthPreset) {
        let newSynth = synth.preset;
        if (newSynth instanceof Tone.PolySynth) {
            newSynth.maxPolyphony = MAX_POLYPHONY;
        }
        if (synth.filter !== undefined) {
            const newFilter = synth.filter;
            newSynth = newSynth.connect(newFilter);
            newFilter.toDestination();
        } else {
            newSynth.toDestination();
        }
        this.synth = newSynth;
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

    public static async clearOnBeatCallbacks() {
        this.onBeatCallbacks = [];
    }

    public static async clearOnMeasureCallbacks() {
        this.onMeasureCallbacks = [];
    }

    public static pressNote(note: Tone.Unit.Frequency) {
        this.synth.triggerAttack(note, Tone.context.currentTime);
    }

    public static releaseNote(note: Tone.Unit.Frequency) {
        this.synth.triggerRelease(note, Tone.context.currentTime);
    }

    public static getProgress() {
        return Tone.Transport.progress;
    }

    public static async saveToFile(
        notes: Note[],
        bpm: number,
        gridLength: number,
        filename: string
    ) {
        if (!this.isInitialized()) {
            await this.init();
        }
        Sequencer.stop();
        Sequencer.clearBuffer();

        new Tone.Part((time, note) => {
            this.synth.triggerAttackRelease(note.pitch, note.length, time);
        }, notes).start(0);
        Tone.Transport.setLoopPoints(0, this.rollTimeToToneTime(gridLength));
        Tone.Transport.loop = false;
        Sequencer.setBpm(bpm);
        const recorder = new Tone.Recorder();
        this.synth.disconnect();
        this.synth.connect(recorder);
        const p = new Promise<Blob>((resolve, reject) => {
            Tone.Transport.scheduleOnce(() => {
                resolve(recorder.stop());
            }, this.rollTimeToToneTime(gridLength));
        });
        await recorder.start();
        Tone.Transport.start();
        saveAs(await p, filename);
        this.synth.toDestination();
    }
}
