import { FunctionComponent, useState } from "react";
import { Piano, KeyboardShortcuts } from "react-piano";
import * as Tone from "tone";
import { Note, Sequencer } from "../../sound/sequencer";
import "./onScreenPiano.css";

interface OnScreenPianoProps {
    onKeyUp: (note: Note) => void;
    playbackEnabled: boolean;
    firstNote: Tone.Unit.Note;
    lastNote: Tone.Unit.Note;
    hidden?: boolean;
}

const OnScreenPiano: FunctionComponent<OnScreenPianoProps> = (props) => {
    const firstNote = Tone.Frequency(props.firstNote).toMidi();
    const lastNote = Tone.Frequency(props.lastNote).toMidi();
    const shouldPlay = props.playbackEnabled || !props.hidden;
    const keyboardShortcuts = KeyboardShortcuts.create({
        firstNote: firstNote,
        lastNote: lastNote,
        keyboardConfig: KeyboardShortcuts.HOME_ROW,
    });
    const [pressedNotes, setPressedNotes] = useState<{
        [note: number]: boolean;
    }>({});
    const [noteStarts, setNoteStarts] = useState<{
        [note: number]: Tone.Unit.Time;
    }>({});

    const getCurrentQTime = () => {
        const t = Tone.Time(Tone.Transport.position).toBarsBeatsSixteenths();
        const splitNum = t.split(":");
        const sixteenths = Number.parseFloat(splitNum[2]);
        const qTime =
            splitNum[0] + ":" + splitNum[1] + ":" + Math.floor(sixteenths);
        return Tone.Time(qTime).toBarsBeatsSixteenths();
    };

    const handlePlayNote = (midiNote: number) => {
        const qTime = getCurrentQTime();
        if (shouldPlay && !pressedNotes[midiNote]) {
            const newPressedNotes = {
                ...pressedNotes,
                [midiNote]: true,
            };
            setNoteStarts({
                ...noteStarts,
                [midiNote]: qTime,
            });
            setPressedNotes(newPressedNotes);
            Sequencer.pressNote(Tone.Midi(midiNote).toFrequency());
        }
    };

    const handleStopNote = (midiNote: number) => {
        if (shouldPlay) {
            const end = getCurrentQTime();
            const start = noteStarts[midiNote];
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
                [midiNote]: false,
            };
            setPressedNotes(newPressedNotes);
            Sequencer.releaseNote(Tone.Midi(midiNote).toFrequency());

            props.onKeyUp({
                pitch: Tone.Midi(midiNote).toNote(),
                time: start,
                length: len.toBarsBeatsSixteenths(),
            });
        }
    };

    return (
        <div
            className="piano-container"
            style={props.hidden ? { display: "none" } : {}}
        >
            <Piano
                playNote={handlePlayNote}
                stopNote={handleStopNote}
                noteRange={{ first: firstNote, last: lastNote }}
                keyboardShortcuts={keyboardShortcuts}
            />
        </div>
    );
};

export default OnScreenPiano;
