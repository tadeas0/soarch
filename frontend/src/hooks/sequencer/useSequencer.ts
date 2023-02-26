import { useContext, useEffect, useState } from "react";
import * as Tone from "tone";
import { SequencerContext } from "../../context/sequencerContext";
import { Note } from "../../interfaces/Note";

export interface Sequencer {
    play: (
        notes: Note[],
        bpm: number,
        partLength: Tone.TimeClass,
        loop?: boolean,
        delay?: Tone.TimeClass
    ) => void;
    stop: () => void;
    addNote: (note: Note) => void;
    deleteNote: (note: Note) => void;
    on: (event: TransportEventNames, cb: (...args: any[]) => void) => void;
    once: (event: TransportEventNames, cb: (...args: any[]) => void) => void;
    isPlaying: boolean;
    progress: number;
    delay: Tone.TimeClass;
}

type TransportEventNames =
    | "start"
    | "stop"
    | "pause"
    | "loop"
    | "loopEnd"
    | "loopStart";

const useSequencer = (): Sequencer => {
    const [currentId, setCurrentId] = useState<string | null>(null);
    const [delay, setDelay] = useState(Tone.Time(0));
    const {
        partRef,
        synthRef,
        setSequencerIds,
        setPlayingId,
        playingId,
        progress: seqProgress,
        setProgress,
    } = useContext(SequencerContext);

    const isPlaying = playingId === currentId;
    const progress = currentId === playingId ? seqProgress : 0;

    useEffect(() => {
        const id = Math.random().toString(16).slice(2);
        setSequencerIds((current) => [...current, id]);
        setCurrentId(id);

        return () => {
            setPlayingId((current) => {
                if (current === id) return null;
                return current;
            });

            setSequencerIds((current) => current.filter((c) => c !== id));
        };
    }, [setPlayingId, setSequencerIds]);

    const stop = () => {
        Tone.Transport.stop();
        setPlayingId(null);
    };

    const play = (
        notes: Note[],
        bpm: number,
        partLength: Tone.TimeClass,
        loop: boolean = false,
        delayBy: Tone.TimeClass = Tone.Time(0)
    ) => {
        if (Tone.context.state !== "running") {
            Tone.start();
        }
        Tone.Transport.stop();
        setProgress(0);
        setPlayingId(currentId);
        Tone.Transport.bpm.value = bpm;
        partRef.current.dispose();

        partRef.current = new Tone.Part((time, note: Note) => {
            synthRef.current.triggerAttackRelease(
                note.pitch.toNote(),
                note.length.toSeconds(),
                time
            );
        }, notes).start(delayBy.toSeconds());

        Tone.Transport.loop = true;
        Tone.Transport.loopEnd = delayBy.toSeconds() + partLength.toSeconds();
        partRef.current.loopEnd = partLength.toSeconds();
        partRef.current.loop = true;
        if (!loop) {
            Tone.Transport.on("loopEnd", () => {
                stop();
            });
        }
        setDelay(delayBy);
        Tone.Transport.start();
    };

    const addNote = (note: Note) => {
        if (isPlaying) {
            partRef.current.add(note.time.toSeconds(), note);
        }
    };

    const deleteNote = (note: Note) => {
        if (isPlaying) {
            partRef.current.remove(note.time.toSeconds(), note);
        }
    };

    const on = (event: TransportEventNames, cb: (...args: any[]) => void) => {
        Tone.Transport.on(event, cb);
    };

    const once = (event: TransportEventNames, cb: (...args: any[]) => void) => {
        Tone.Transport.once(event, cb);
    };

    return {
        play,
        stop,
        addNote,
        deleteNote,
        on,
        once,
        delay,
        isPlaying,
        progress,
    };
};

export default useSequencer;
