import * as Tone from "tone";
import {
    DEFAULT_PIANO_ROLL_HEIGHT,
    PIANO_ROLL_LOWEST_NOTE,
    PIANO_ROLL_NOTE_SUBDIVISION,
} from "./constants";

interface Note {
    start: number;
    pitch: Tone.FrequencyClass;
    length: Tone.TimeClass;
}

const Sequencer = {
    addGridToBuffer(noteGrid: boolean[][]) {
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
                    notes.push({
                        start: noteStart,
                        pitch: this.noteToFrequency(r),
                        length: this.lengthToTime(noteLength),
                    });
                    noteOn = false;
                    noteLength = 0;
                }
            }
        }
        // console.log(notes);
        const synth = new Tone.PolySynth().toDestination();
        notes.forEach((n) => {
            synth.triggerAttackRelease(
                n.pitch.toNotation(),
                n.length.toMilliseconds()
            );
            // this.synth.triggerAttackRelease(sequence[this.currentBeat], "8n");
        });

        // Tone.Transport.scheduleOnce()
    },

    noteToFrequency(note: number) {
        return Tone.Frequency(PIANO_ROLL_LOWEST_NOTE).transpose(
            DEFAULT_PIANO_ROLL_HEIGHT - note - 1
        );
    },

    lengthToTime(length: number) {
        return Tone.Time(`0:0:${(16 / PIANO_ROLL_NOTE_SUBDIVISION) * length}`);
    },

    // currentBeat: number;
    // synth: Tone.Synth<Tone.SynthOptions>;

    // constructor() {
    //     this.currentBeat = 0;
    //     this.synth = new Tone.Synth().toDestination();
    //     console.log("init synth");
    // }

    // // init() {
    // //     this.playSequence(["C3", "C4"]);
    // // }

    // playSequence(sequence: string[]) {
    //     const repeat = () => {
    //         this.synth.triggerAttackRelease(sequence[this.currentBeat], "8n");
    //         this.currentBeat += 1;
    //     };
    //     Tone.Transport.bpm.value = 120;
    //     // Tone.Transport.scheduleRepeat(new Tone.Sequence(["C3"]), "8n");
    //     Tone.start();
    //     Tone.Transport.start();
    // }

    // stop() {
    //     Tone.Transport.stop();
    // }
};

export default Sequencer;
