import { FunctionComponent, useState } from "react";
import { Piano, KeyboardShortcuts } from "react-piano";
import * as Tone from "tone";
import { Note, Sequencer } from "../../sound/sequencer";
import "./onScreenPiano.css";
import {
    MAX_OCTAVE_OFFSET,
    ON_SCREEN_PIANO_HIGH,
    ON_SCREEN_PIANO_LOW,
} from "../../constants";
import { HiMinus, HiPlus } from "react-icons/hi";

interface OnScreenPianoProps {
    onKeyUp: (note: Note) => void;
    playbackEnabled: boolean;
    hidden?: boolean;
}

const OnScreenPiano: FunctionComponent<OnScreenPianoProps> = (props) => {
    const [octaveOffset, setOctaveOffset] = useState(0);
    const octaveSize = 12;
    const range = {
        first:
            Tone.Frequency(ON_SCREEN_PIANO_LOW).toMidi() +
            octaveOffset * octaveSize,
        last:
            Tone.Frequency(ON_SCREEN_PIANO_HIGH).toMidi() +
            octaveOffset * octaveSize,
    };

    const shouldPlay = props.playbackEnabled || !props.hidden;
    const keyboardShortcuts = KeyboardShortcuts.create({
        firstNote: range.first,
        lastNote: range.last,
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

    const handleMoveUp = () => {
        if (octaveOffset < MAX_OCTAVE_OFFSET)
            setOctaveOffset((current) => current + 1);
    };

    const handleMoveDown = () => {
        if (octaveOffset > -MAX_OCTAVE_OFFSET)
            setOctaveOffset((current) => current - 1);
    };

    const getOctaveString = () => {
        if (octaveOffset > 0) return "+" + octaveOffset;
        return octaveOffset;
    };

    return (
        <div
            className="piano-container"
            style={props.hidden ? { display: "none" } : {}}
        >
            <div className="flex flex-row justify-end">
                <button
                    className=" flex w-1/3 items-center justify-center rounded-t border-2 border-b-0 border-dark-primary bg-light-primary text-3xl text-white hover:bg-medium-primary hover:text-black"
                    onClick={handleMoveDown}
                >
                    <HiMinus />
                </button>
                <div className="w-1/3 rounded-t border-2 border-b-0 border-dark-primary bg-light-primary p-2 text-center text-3xl text-white">
                    {getOctaveString()}
                </div>
                <button
                    className="flex w-1/3 items-center justify-center rounded-t border-2 border-b-0 border-dark-primary bg-light-primary text-3xl text-white hover:bg-medium-primary hover:text-black"
                    onClick={handleMoveUp}
                >
                    <HiPlus />
                </button>
            </div>
            <Piano
                playNote={handlePlayNote}
                stopNote={handleStopNote}
                noteRange={range}
                keyboardShortcuts={keyboardShortcuts}
            />
        </div>
    );
};

export default OnScreenPiano;
