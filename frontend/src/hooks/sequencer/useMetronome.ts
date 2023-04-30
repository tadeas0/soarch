import { useCallback, useEffect, useRef, useState } from "react";
import * as Tone from "tone";

const useMetronome = (delay: Tone.TimeClass = Tone.Time(0)) => {
    const [enabled, setEnabledState] = useState(false);
    const metronomePart = useRef<Tone.Part | null>(null);
    const metronomeSampler = useRef<Tone.Sampler | null>(null);
    if (!metronomeSampler.current) {
        metronomeSampler.current = new Tone.Sampler({
            urls: {
                G4: "/samples/metronome_down.mp3",
                C4: "/samples/metronome_up.mp3",
            },
            release: 1,
            volume: -100,
        }).toDestination();
    }

    const fillMetronome = useCallback(() => {
        const metronomeNotes = [];

        for (let i = 0; i < 4; i++) {
            const pitch = i % 4 === 0 ? "G4" : "C4";
            metronomeNotes.push({ time: `0:${i}:0`, pitch });
        }
        const m = new Tone.Part((time, note) => {
            metronomeSampler.current?.triggerAttackRelease(
                note.pitch,
                "0:0:1",
                time
            );
        }, metronomeNotes).start(delay.toSeconds());
        m.loop = true;
        m.loopEnd = "1m";
        metronomePart.current = m;
    }, [delay]);

    useEffect(() => {
        fillMetronome();

        return () => {
            metronomePart.current?.dispose();
        };
    }, [fillMetronome]);

    useEffect(() => {
        setEnabledState(false);
        return () => {
            setEnabledState(false);
            metronomePart.current?.dispose();
        };
    }, [metronomeSampler]);

    const enable = () => {
        setEnabledState(true);
        if (metronomeSampler.current) {
            metronomeSampler.current.volume.value = 0;
        }
    };

    const disable = () => {
        setEnabledState(false);
        if (metronomeSampler.current)
            metronomeSampler.current.volume.value = -100;
    };

    const setEnabled = (value: boolean) => {
        if (value === true) {
            enable();
        } else {
            disable();
        }
    };

    return { enabled, setEnabled };
};

export default useMetronome;
