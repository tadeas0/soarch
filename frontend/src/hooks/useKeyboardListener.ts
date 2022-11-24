import * as Tone from "tone";
import {
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useState,
} from "react";
import { Sequencer, Note } from "../sound/sequencer";
import { KEYBOARD_NOTE_MAP, PIANO_ROLL_LOWEST_NOTE } from "../constants";

const useKeyboardListener = (
    onKeyUp: (note: Note) => void,
    lowestNote: Tone.Unit.Note = PIANO_ROLL_LOWEST_NOTE
): [boolean, Dispatch<SetStateAction<boolean>>] => {
    const [pressedNotes, setPressedNotes] = useState<{
        [note: Tone.Unit.Frequency]: boolean;
    }>({});
    const [noteStarts, setNoteStarts] = useState<{
        [note: Tone.Unit.Frequency]: Tone.Unit.Time;
    }>({});
    const [playbackEnabled, setPlaybackEnabled] = useState(false);

    const getCurrentQTime = () => {
        const t = Tone.Time(Tone.Transport.position).toBarsBeatsSixteenths();
        const splitNum = t.split(":");
        const sixteenths = Number.parseFloat(splitNum[2]);
        const qTime =
            splitNum[0] + ":" + splitNum[1] + ":" + Math.floor(sixteenths);
        return Tone.Time(qTime).toBarsBeatsSixteenths();
    };

    const keyDownListener = useCallback(
        (event: KeyboardEvent) => {
            const qTime = getCurrentQTime();
            if (
                playbackEnabled &&
                event.code in KEYBOARD_NOTE_MAP &&
                !pressedNotes[event.code]
            ) {
                const newPressedNotes = {
                    ...pressedNotes,
                    [event.code]: true,
                };
                setNoteStarts({
                    ...noteStarts,
                    [KEYBOARD_NOTE_MAP[event.code]]: qTime,
                });
                setPressedNotes(newPressedNotes);
                Sequencer.pressNote(
                    Tone.Frequency(lowestNote)
                        .transpose(KEYBOARD_NOTE_MAP[event.code])
                        .toNote()
                );
            }
        },
        [pressedNotes, noteStarts, playbackEnabled, lowestNote]
    );

    const keyUpListener = useCallback(
        (event: KeyboardEvent) => {
            if (playbackEnabled && event.code in KEYBOARD_NOTE_MAP) {
                const end = getCurrentQTime();
                const start = noteStarts[KEYBOARD_NOTE_MAP[event.code]];
                const splEnd = end.split(":");
                const splStart = start.toString().split(":");
                let len = Tone.Time(
                    "0:0:" +
                        (parseInt(splEnd[0]) * 16 +
                            parseInt(splEnd[1]) * 4 +
                            parseInt(splEnd[2]) -
                            (parseInt(splStart[0]) * 16 +
                                parseInt(splStart[1]) * 4 +
                                parseInt(splStart[2])))
                );

                if (len.toBarsBeatsSixteenths() === "0:0:0")
                    len = Tone.Time("0:0:1");

                const newPressedNotes = {
                    ...pressedNotes,
                    [event.code]: false,
                };
                setPressedNotes(newPressedNotes);
                Sequencer.releaseNote(
                    Tone.Frequency(lowestNote)
                        .transpose(KEYBOARD_NOTE_MAP[event.code])
                        .toNote()
                );

                onKeyUp({
                    pitch: Tone.Frequency(lowestNote)
                        .transpose(KEYBOARD_NOTE_MAP[event.code])
                        .toNote(),
                    time: start,
                    length: len.toBarsBeatsSixteenths(),
                });
            }
        },
        [pressedNotes, noteStarts, playbackEnabled, onKeyUp, lowestNote]
    );

    useEffect(() => {
        document.addEventListener("keydown", keyDownListener);
        document.addEventListener("keyup", keyUpListener);
        return () => {
            document.removeEventListener("keydown", keyDownListener);
            document.removeEventListener("keyup", keyUpListener);
        };
    }, [keyDownListener, keyUpListener]);

    useEffect(() => {
        let newPressedNotes: { [note: Tone.Unit.Frequency]: boolean } = {};
        for (let i in KEYBOARD_NOTE_MAP) newPressedNotes[i] = false;
        setPressedNotes(newPressedNotes);
    }, []);

    return [playbackEnabled, setPlaybackEnabled];
};

export default useKeyboardListener;
