import * as Tone from "tone";
import { useCallback, useEffect, useState } from "react";
import { Sequencer } from "../sequencer";
import { KEYBOARD_NOTE_MAP } from "../constants";

const useKeyboardListener = (): void => {
    const [pressedNotes, setPressedNotes] = useState<{
        [note: Tone.Unit.Frequency]: boolean;
    }>({});

    const keyDownListener = useCallback(
        (event: KeyboardEvent) => {
            if (event.code in KEYBOARD_NOTE_MAP && !pressedNotes[event.code]) {
                const newPressedNotes = {
                    ...pressedNotes,
                    [event.code]: true,
                };
                setPressedNotes(newPressedNotes);
                Sequencer.pressNote(KEYBOARD_NOTE_MAP[event.code]);
            }
        },
        [pressedNotes]
    );

    const keyUpListener = useCallback(
        (event: KeyboardEvent) => {
            if (event.code in KEYBOARD_NOTE_MAP) {
                const newPressedNotes = {
                    ...pressedNotes,
                    [event.code]: false,
                };
                setPressedNotes(newPressedNotes);
                Sequencer.releaseNote(KEYBOARD_NOTE_MAP[event.code]);
            }
        },
        [pressedNotes]
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
};

export default useKeyboardListener;
