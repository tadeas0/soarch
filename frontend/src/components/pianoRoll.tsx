import * as React from "react";
import * as Tone from "tone";
import { useState, FunctionComponent } from "react";
import {
    DEFAULT_PIANO_ROLL_HEIGHT,
    DEFAULT_PIANO_ROLL_WIDTH,
    MEASURE_LENGTH,
} from "../constants";
import { BsFillPlayFill, BsPauseFill } from "react-icons/bs";
import { MdDelete, MdOutlineSearch } from "react-icons/md";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import usePlayback from "../hooks/usePlayback";
import { Note, Sequencer } from "../sequencer";
import "./pianoRoll.css";
import PianoRollGrid, { GridParams } from "./pianoRollGrid";

interface PianoRollProps {
    noteWidth: number;
    noteHeight: number;
    lowestNote: Tone.Unit.Note;
    onSubmit: (notes: Note[], gridLength: number) => void;
}

const PianoRoll: FunctionComponent<PianoRollProps> = (props) => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [gridParams, setGridParams] = useState<GridParams>({
        width: props.noteWidth,
        height: props.noteHeight,
        lowestNote: props.lowestNote,
    });
    const [isPlaying, handleStart, handleStop] = usePlayback();

    const handleAddNote = (pitch: number, position: number) => {
        const newNote: Note = Sequencer.createNoteObject(
            position,
            4,
            gridParams.height - pitch - 1
        );

        const newNotes = [...notes, newNote];
        setNotes(newNotes);
    };

    const handleDeleteNote = (pitch: number, position: number) => {
        let newNotes = notes.filter((n) => {
            const s = Sequencer.toneTimeToRollTime(n.time);
            const e = s + Sequencer.toneTimeToRollTime(n.length);
            const p = Sequencer.tonePitchToRollPitch(
                n.pitch,
                props.lowestNote,
                gridParams.height
            );
            return !(p === pitch && s <= position && e >= position);
        });
        setNotes(newNotes);
    };

    const handleClear = () => {
        setNotes([]);
        if (isPlaying) {
            handleStop();
        }
    };

    const handlePlayClick = () => {
        if (!isPlaying) {
            handleStart(notes, gridParams.width);
        } else {
            handleStop();
        }
    };

    const handleAddMeasure = () => {
        setGridParams({
            ...gridParams,
            width: gridParams.width + MEASURE_LENGTH,
        });
    };

    const canRemoveMeasure = () => {
        return gridParams.width > 2 * MEASURE_LENGTH;
    };

    const handleRemoveMeasure = () => {
        if (canRemoveMeasure()) {
            const newGridLength = gridParams.width - MEASURE_LENGTH;
            const newNotes = notes.filter((n) => {
                return (
                    Sequencer.toneTimeToRollTime(n.time) +
                        Sequencer.toneTimeToRollTime(n.length) <
                    newGridLength
                );
            });
            setGridParams({ ...gridParams, width: newGridLength });
            handleStop();
            setNotes(newNotes);
        }
    };

    return (
        <div className="pianoroll">
            <button onClick={handlePlayClick}>
                {isPlaying ? <BsPauseFill /> : <BsFillPlayFill />}
            </button>
            <button
                className="right"
                onClick={() =>
                    props.noteWidth && props.onSubmit(notes, gridParams.width)
                }
            >
                <MdOutlineSearch />
            </button>
            <button onClick={handleClear}>
                <MdDelete />
            </button>
            <button
                onClick={handleRemoveMeasure}
                disabled={!canRemoveMeasure()}
            >
                <AiOutlineMinus />
            </button>
            <button onClick={handleAddMeasure}>
                <AiOutlinePlus />
            </button>
            <PianoRollGrid
                onAddNote={handleAddNote}
                onDeleteNote={handleDeleteNote}
                gridParams={gridParams}
                notes={notes}
            />
        </div>
    );
};

PianoRoll.defaultProps = {
    noteWidth: DEFAULT_PIANO_ROLL_WIDTH,
    noteHeight: DEFAULT_PIANO_ROLL_HEIGHT,
};

export default PianoRoll;
