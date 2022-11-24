import { FunctionComponent } from "react";
import { Piano, KeyboardShortcuts } from "react-piano";
// import "react-piano/dist/styles.css";
import "./onScreenPiano.css";

interface OnScreenPianoProps {}

const OnScreenPiano: FunctionComponent<OnScreenPianoProps> = (props) => {
    const firstNote = 38;
    const lastNote = 77;
    const keyboardShortcuts = KeyboardShortcuts.create({
        firstNote: firstNote,
        lastNote: lastNote,
        keyboardConfig: KeyboardShortcuts.HOME_ROW,
    });

    return (
        <div className="piano-container">
            <Piano
                playNote={console.log}
                stopNote={console.log}
                noteRange={{ first: firstNote, last: lastNote }}
                keyboardShortcuts={keyboardShortcuts}
                renderNoteLabel={console.log}
            />
        </div>
    );
};

export default OnScreenPiano;
