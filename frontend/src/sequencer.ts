import * as Tone from "tone";
import {
    MEASURE_LENGTH,
    PIANO_ROLL_LOWEST_NOTE,
    PIANO_ROLL_NOTE_SUBDIVISION,
} from "./constants";

export interface Note {
    time: Tone.Unit.Time;
    pitch: Tone.Unit.Note;
    length: Tone.Unit.Time;
}

export abstract class Sequencer {
    private static synth: Tone.PolySynth | Tone.Synth = new Tone.PolySynth(
        Tone.Synth,
        {
            oscillator: {
                type: "sine",
            },
        }
    ).toDestination();

    public static async init() {
        await Tone.start();
    }

    public static addGridToBuffer(noteGrid: boolean[][]) {
        let notes: Note[] = this.transformGridToNotes(noteGrid);

        new Tone.Part((time, note) => {
            this.synth.triggerAttackRelease(note.pitch, note.length, time);
        }, notes).start(0);

        Tone.Transport.setLoopPoints(
            0,
            this.rollTimeToToneTime(noteGrid[0].length)
        );

        Tone.Transport.loop = true;
    }

    public static transformGridToNotes(noteGrid: boolean[][]) {
        let notes: Note[] = [];
        for (let r = 0; r < noteGrid.length; r++) {
            let noteOn = false;
            let noteLength = 0;
            let noteStart = 0;
            for (let c = 0; c < noteGrid[r].length; c++) {
                if (noteGrid[r][c] && noteOn) {
                    noteLength += 1;
                } else if (noteGrid[r][c]) {
                    noteOn = true;
                    noteLength = 1;
                    noteStart = c;
                } else if (noteOn && !noteGrid[r][c]) {
                    notes.push(
                        this.createNoteObject(
                            noteStart,
                            noteLength,
                            noteGrid.length - r - 1
                        )
                    );
                    noteOn = false;
                    noteLength = 0;
                }
            }
        }

        return notes;
    }

    public static transformNotesToGrid(notes: Note[]): boolean[][] {
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
        const gridHeight = highB - lowC;

        let grid = Array.from(Array(gridHeight), () =>
            Array(gridWidth).fill(false)
        );

        notes.forEach((n) => {
            const start = this.toneTimeToRollTime(n.time);
            let length = this.toneTimeToRollTime(n.length);
            if (length === 0) length = 1;
            const end = start + length;
            const pitch =
                gridHeight - (Tone.Frequency(n.pitch).toMidi() - lowC) - 1;
            grid[pitch] = grid[pitch].fill(
                true,
                start - gridStart,
                end - gridStart
            );
        });

        return grid;
    }

    public static clearBuffer() {
        Tone.Transport.cancel();
    }

    public static setBpm(bpm: number) {
        Tone.Transport.bpm.value = 120;
    }

    public static setSynth(synth: Tone.Synth) {
        this.synth = synth;
    }

    private static createNoteObject(
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

    private static rollTimeToToneTime(time: number) {
        return Tone.Time(
            `0:0:${(16 / PIANO_ROLL_NOTE_SUBDIVISION) * time}`
        ).toBarsBeatsSixteenths();
    }

    private static toneTimeToRollTime(time: Tone.Unit.Time) {
        const split = Tone.Time(time).toBarsBeatsSixteenths().split(":");
        return (
            parseInt(split[0]) * 16 +
            parseInt(split[1]) * 4 +
            parseInt(split[2]) * 1
        );
    }

    public static isPlaying() {
        return Tone.Transport.state === "started";
    }

    public static start() {
        Tone.Transport.start();
    }

    public static stop() {
        if (this.synth instanceof Tone.Synth) this.synth.triggerRelease();
        else if (this.synth instanceof Tone.PolySynth) this.synth.releaseAll();
        Tone.Transport.stop();
    }

    public static isInitialized() {
        return Tone.context.state === "running";
    }
}
