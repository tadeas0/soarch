import { useContext, useEffect, useRef, useState } from "react";
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
    addOnPlay: (cb: () => void) => number;
    addOnStop: (cb: () => void) => number;
    clearOnPlay: (n: number) => void;
    clearOnStop: (n: number) => void;
    isPlaying: boolean;
    progress: number;
    delay: Tone.TimeClass;
}

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
    const onPlayEvents = useRef(new Map<number, () => void>());
    const onStopEvents = useRef(new Map<number, () => void>());

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
        onStopEvents.current.forEach((cb) => {
            cb();
        });
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
        onPlayEvents.current.forEach((cb) => {
            Tone.Transport.scheduleOnce(() => {
                cb();
            }, delayBy.toSeconds());
        });
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

    const maxMapKey = (m: Map<number, any>) => Math.max(...m.keys());
    const setNewCb = (m: Map<number, () => void>, cb: () => void) => {
        const nextKey = maxMapKey(m) + 1;
        m.set(nextKey, cb);
        return nextKey;
    };

    const addOnPlay = (cb: () => void) => setNewCb(onPlayEvents.current, cb);
    const addOnStop = (cb: () => void) => setNewCb(onStopEvents.current, cb);
    const clearOnPlay = (n: number) => onPlayEvents.current.delete(n);
    const clearOnStop = (n: number) => onStopEvents.current.delete(n);

    return {
        play,
        stop,
        addNote,
        deleteNote,
        addOnPlay,
        addOnStop,
        clearOnPlay,
        clearOnStop,
        delay,
        isPlaying,
        progress,
    };
};

export default useSequencer;
