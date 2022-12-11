import { useContext } from "react";
import * as Tone from "tone";
import { SequencerContext } from "../../context/sequencerContext";
import { Note } from "../../interfaces/Note";
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
        partLength: Tone.TimeClass,
        loop: boolean = false
    ) => {
        if (Tone.context.state !== "running") {
            Tone.start();
        }
        Tone.Transport.bpm.value = bpm;
        setIsPlaying(true);
        partRef.current?.dispose();
        partRef.current = new Tone.Part((time, note: Note) => {
            synth.triggerAttackRelease(
                note.pitch.toNote(),
                note.length.toSeconds(),
                time
            );
        }, notes).start(0);
        if (loop) {
            Tone.Transport.loop = true;
            Tone.Transport.loopEnd = partLength.toSeconds();
        } else {
            Tone.Transport.loop = false;
            Tone.Transport.scheduleOnce(() => {
                stop();
            }, partLength.toSeconds());
        }
        Tone.Transport.start();
    };

    const addNote = (note: Note) => {
        partRef.current?.add(note.time.toSeconds(), note);
    };

    const deleteNote = (note: Note) => {
        partRef.current?.remove(note.time.toSeconds(), note);
    };

    return { play, stop, addNote, deleteNote, isPlaying };
};

export default useSequencer;
