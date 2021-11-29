import * as Tone from "tone";
import { useCallback, useEffect, useState } from "react";
import { Sequencer, Note } from "../sequencer";
import { KEYBOARD_NOTE_MAP } from "../constants";

const useKeyboardListener = (
    onKeyUp: (note: Note) => void
): [boolean, (playbackEnabled: boolean) => void] => {
    const [pressedNotes, setPressedNotes] = useState<{
        [note: Tone.Unit.Frequency]: boolean;
    }>({});
    const [noteStarts, setNoteStarts] = useState<{
        [note: Tone.Unit.Frequency]: Tone.Unit.Time;
    }>({});
    const [playbackEnabled, setPlaybackEnabled] = useState(false);

    const getCurrentQTime = () => {
        const qTime = Tone.Time(Tone.Transport.position).quantize("16n");
        return Tone.Time(qTime).toBarsBeatsSixteenths();
    };

    const keyDownListener = useCallback(
        (event: KeyboardEvent) => {
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
                    [KEYBOARD_NOTE_MAP[event.code]]: getCurrentQTime(),
                });
                setPressedNotes(newPressedNotes);
                Sequencer.pressNote(KEYBOARD_NOTE_MAP[event.code]);
            }
        },
        [pressedNotes, noteStarts, playbackEnabled]
    );

    const keyUpListener = useCallback(
        (event: KeyboardEvent) => {
            if (playbackEnabled && event.code in KEYBOARD_NOTE_MAP) {
                const end = getCurrentQTime();
                const start = noteStarts[KEYBOARD_NOTE_MAP[event.code]];
                const splEnd = end.split(":");
                const splStart = start.toString().split(":");
                const len = Tone.Time(
                    "0:0:" +
                        (parseInt(splEnd[0]) * 16 +
                            parseInt(splEnd[1]) * 4 +
                            parseInt(splEnd[2]) -
                            (parseInt(splStart[0]) * 16 +
                                parseInt(splStart[1]) * 4 +
                                parseInt(splStart[2])))
                );

                const newPressedNotes = {
                    ...pressedNotes,
                    [event.code]: false,
                };
                setPressedNotes(newPressedNotes);
                Sequencer.releaseNote(KEYBOARD_NOTE_MAP[event.code]);

                onKeyUp({
                    pitch: Tone.Frequency(
                        KEYBOARD_NOTE_MAP[event.code]
                    ).toNote(),
                    time: start,
                    length: len.toBarsBeatsSixteenths(),
                });
            }
        },
        [pressedNotes, noteStarts, playbackEnabled, onKeyUp]
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
