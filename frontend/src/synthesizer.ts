import * as Tone from "tone";

export class Synthesizer {
    currentBeat: number;
    synth: Tone.Synth<Tone.SynthOptions>;

    constructor() {
        this.currentBeat = 0;
        this.synth = new Tone.Synth().toDestination();
    }

    init() {
        this.playSequence(["C3", "C4"]);
    }

    playSequence(sequence: string[]) {
        const repeat = () => {
            this.synth.triggerAttackRelease(sequence[this.currentBeat], "8n");
            this.currentBeat += 1;
        };
        Tone.Transport.bpm.value = 120;
        Tone.Transport.scheduleRepeat(repeat, "8n");
        Tone.start();
        Tone.Transport.start();
    }
}
