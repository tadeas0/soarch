import { useContext } from "react";
import * as Tone from "tone";
import { SequencerContext } from "../../context/sequencerContext";
import { Note } from "../../sound/sequencer";
import useSequencerStore from "../../stores/sequencerStore";

const useSequencer = () => {
    const [isPlaying, synth, setIsPlaying] = useSequencerStore((state) => [
        state.isPlaying,
        state.synth,
        state.setIsPlaying,
    ]);
    const partRef = useContext(SequencerContext);

    const stop = () => {
        Tone.Transport.stop();
        setIsPlaying(false);
    };

    const play = (
        notes: Note[],
        bpm: number,
        partLength: Tone.Unit.Time,
        loop: boolean = false
    ) => {
        if (Tone.context.state !== "running") {
            Tone.start();
        }
        Tone.Transport.bpm.value = bpm;
        setIsPlaying(true);
        partRef.current?.dispose();
        partRef.current = new Tone.Part((time, note) => {
            synth.triggerAttackRelease(note.pitch, note.length, time);
        }, notes).start(0);
        if (loop) {
            Tone.Transport.loop = true;
            Tone.Transport.loopEnd = partLength;
        } else {
            Tone.Transport.loop = false;
            Tone.Transport.scheduleOnce(() => {
                stop();
            }, partLength);
        }
        Tone.Transport.start();
    };

    const addNote = (note: Note) => {
        partRef.current?.add(note.time, note);
    };

    const deleteNote = (note: Note) => {
        partRef.current?.remove(note.time, note);
    };

    return { play, stop, addNote, deleteNote, isPlaying };
};

export default useSequencer;
