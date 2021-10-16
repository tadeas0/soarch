import * as Tone from "tone";
import {
    DEFAULT_PIANO_ROLL_HEIGHT,
    PIANO_ROLL_LOWEST_NOTE,
    PIANO_ROLL_NOTE_SUBDIVISION,
} from "./constants";

interface Note {
    time: Tone.Unit.Time;
    pitch: Tone.Unit.Note;
    length: Tone.Unit.Time;
}

export default abstract class Sequencer {
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
                    notes.push(this.createNoteObject(noteStart, noteLength, r));
                    noteOn = false;
                    noteLength = 0;
                }
            }
        }

        new Tone.Part((time, note) => {
            this.synth.triggerAttackRelease(note.pitch, note.length, time);
        }, notes).start(0);

        Tone.Transport.setLoopPoints(
            0,
            this.rollTimeToToneTime(noteGrid[0].length)
        );

        Tone.Transport.loop = true;
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
                .transpose(DEFAULT_PIANO_ROLL_HEIGHT - notePitch - 1)
                .toNote(),
            length: this.rollTimeToToneTime(noteLength),
        };
    }

    private static rollTimeToToneTime(time: number) {
        return Tone.Time(
            `0:0:${(16 / PIANO_ROLL_NOTE_SUBDIVISION) * time}`
        ).toBarsBeatsSixteenths();
    }

    public static isPlaying() {
        return Tone.Transport.state === "started";
    }

    public static start() {
        Tone.Transport.start();
    }

    public static stop() {
        Tone.Transport.stop();
    }

    public static isInitialized() {
        return Tone.context.state === "running";
    }
}
