import * as Tone from "tone";
import {
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useState,
} from "react";
import { Note } from "../interfaces/Note";
import { NoteMessageEvent, WebMidi } from "webmidi";
import useSynth from "./sequencer/useSynth";

const useMidiListener = (
    onKeyUp: (note: Note) => void
): [boolean, Dispatch<SetStateAction<boolean>>] => {
    const [, setPressedNotes] = useState<
        Map<Tone.Unit.Frequency, Tone.Unit.Time>
    >(new Map());
    const [playbackEnabled, setPlaybackEnabled] = useState(false);
    const { triggerAttack, triggerRelease } = useSynth();

    const getCurrentQTime = () => {
        const t = Tone.Time(Tone.Transport.position).toBarsBeatsSixteenths();
        const splitNum = t.split(":");
        const sixteenths = Number.parseFloat(splitNum[2]);
        const qTime = `${splitNum[0]}:${splitNum[1]}:${Math.floor(sixteenths)}`;
        return Tone.Time(qTime).toBarsBeatsSixteenths();
    };

    const keyDownListener = useCallback(
        (event: NoteMessageEvent) => {
            setPressedNotes((current) => {
                const note = event.note.number;
                const qTime = getCurrentQTime();
                if (playbackEnabled && !current.get(note)) {
                    triggerAttack(Tone.Midi(note));
                    return new Map(current.set(note, qTime));
                }
                return current;
            });
        },
        [playbackEnabled, triggerAttack]
    );

    const keyUpListener = useCallback(
        (event: NoteMessageEvent) => {
            setPressedNotes((current) => {
                const note = event.note.number;
                const start = current.get(note);
                if (!start) return current;
                triggerRelease(Tone.Midi(note));
                const end = getCurrentQTime();
                const splEnd = end.split(":");
                const splStart = start.toString().split(":");
                let len = Tone.Time(
                    `0:0:${
                        parseInt(splEnd[0], 10) * 16 +
                        parseInt(splEnd[1], 10) * 4 +
                        parseInt(splEnd[2], 10) -
                        (parseInt(splStart[0], 10) * 16 +
                            parseInt(splStart[1], 10) * 4 +
                            parseInt(splStart[2], 10))
                    }`
                );

                if (len.toBarsBeatsSixteenths() === "0:0:0")
                    len = Tone.Time("0:0:1");
                onKeyUp({
                    pitch: Tone.Midi(note),
                    time: Tone.Time(start),
                    length: len,
                });
                const m = new Map(current);
                m.delete(note);
                return m;
            });
        },
        [onKeyUp, triggerRelease]
    );

    const onEnabled = useCallback(() => {
        if (WebMidi.inputs.length > 1) {
            WebMidi.inputs[1].addListener("noteon", keyDownListener);
            WebMidi.inputs[1].addListener("noteoff", keyUpListener);
        }
    }, [keyDownListener, keyUpListener]);

    useEffect(() => {
        WebMidi.enable()
            .then(onEnabled)
            .catch((err) => {
                console.warn(err);
                console.log("Browser does not support midi");
            });
        return () => {
            if (WebMidi.inputs.length > 1) {
                WebMidi.inputs[1].removeListener("noteon");
                WebMidi.inputs[1].removeListener("noteoff");
            }
        };
    }, [keyDownListener, keyUpListener, onEnabled]);

    useEffect(() => {
        setPressedNotes(new Map());
    }, []);

    return [playbackEnabled, setPlaybackEnabled];
};

export default useMidiListener;
