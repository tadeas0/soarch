import saveAs from "file-saver";
import * as Tone from "tone";
import { Note } from "../interfaces/Note";
import { SequencerSynth } from "../types/sequencerSynth";
import { rollTimeToToneTime } from "./coordConversion";

const saveToFile = async (
    notes: Note[],
    bpm: number,
    gridLength: number,
    filename: string,
    synth: SequencerSynth
) => {
    if (Tone.context.state !== "running") {
        await Tone.start();
    }
    Tone.Transport.cancel();
    Tone.Transport.stop();

    new Tone.Part((time, note: Note) => {
        synth.triggerAttackRelease(
            note.pitch.toNote(),
            note.length.toSeconds(),
            time
        );
    }, notes).start(0);
    Tone.Transport.setLoopPoints(0, rollTimeToToneTime(gridLength).toSeconds());
    Tone.Transport.loop = false;
    Tone.Transport.bpm.value = bpm;
    const recorder = new Tone.Recorder();
    synth.disconnect();
    synth.connect(recorder);
    const p = new Promise<Blob>((resolve) => {
        Tone.Transport.scheduleOnce(() => {
            resolve(recorder.stop());
        }, rollTimeToToneTime(gridLength).toSeconds());
    });
    await recorder.start();
    Tone.Transport.start();
    saveAs(await p, filename);
    synth.toDestination();
};

export default saveToFile;
