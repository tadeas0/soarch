import * as React from "react";
import { useState, FunctionComponent, MouseEvent } from "react";
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
import PianoRollGrid from "./pianoRollGrid";

interface PianoRollProps {
    noteWidth?: number;
    noteHeight?: number;
    onSubmit: (notes: Note[], gridLength: number) => void;
}

const PianoRoll: FunctionComponent<PianoRollProps> = (props) => {
    const [noteGrid, setNoteGrid] = useState<boolean[][]>(
        Array.from(Array(props.noteHeight), () =>
            Array(props.noteWidth).fill(false)
        )
    );

    const [isPlaying, handlePlayToggle] = usePlayback();

    const handleClick = (pitch: number, position: number) => {
        let newNotes = [...noteGrid];
        newNotes[pitch][position] = true;
        setNoteGrid(newNotes);
    };

    const handleMouseOver = (
        e: MouseEvent<HTMLElement>,
        pitch: number,
        position: number
    ) => {
        if (e.buttons === 1) {
            handleClick(pitch, position);
        } else if (e.buttons === 2) {
            handleRightClick(pitch, position);
        }
    };

    const handleRightClick = (pitch: number, position: number) => {
        let newNotes = [...noteGrid];
        newNotes[pitch][position] = false;
        setNoteGrid(newNotes);
    };

    const handleClear = () => {
        setNoteGrid(
            Array.from(Array(noteGrid.length), () =>
                Array(noteGrid[0].length).fill(false)
            )
        );
        if (isPlaying) {
            handlePlayToggle();
            Sequencer.clearBuffer();
        }
    };

    const handlePlayClick = () => {
        if (!isPlaying) {
            Sequencer.clearBuffer();
            Sequencer.addGridToBuffer(noteGrid);
        }
        handlePlayToggle();
    };

    const handleAddMeasure = () => {
        let newNoteGrid = [...noteGrid];
        for (let i = 0; i < noteGrid.length; i++) {
            newNoteGrid[i] = newNoteGrid[i].concat(
                Array(MEASURE_LENGTH).fill(false)
            );
        }
        setNoteGrid(newNoteGrid);
    };

    const canRemoveMeasure = () => {
        return noteGrid[0].length > 2 * MEASURE_LENGTH;
    };

    const handleRemoveMeasure = () => {
        if (canRemoveMeasure()) {
            let newNoteGrid = [...noteGrid];
            for (let i = 0; i < noteGrid.length; i++) {
                newNoteGrid[i] = newNoteGrid[i].slice(
                    0,
                    noteGrid[0].length - MEASURE_LENGTH
                );
            }
            setNoteGrid(newNoteGrid);
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
                    props.noteWidth &&
                    props.onSubmit(
                        Sequencer.transformGridToNotes(noteGrid),
                        props.noteWidth
                    )
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
                onMouseDown={handleClick}
                onRightClick={handleRightClick}
                onMouseOver={handleMouseOver}
                noteGrid={noteGrid}
            />
        </div>
    );
};

PianoRoll.defaultProps = {
    noteWidth: DEFAULT_PIANO_ROLL_WIDTH,
    noteHeight: DEFAULT_PIANO_ROLL_HEIGHT,
};

export default PianoRoll;
