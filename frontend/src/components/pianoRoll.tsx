import * as React from "react";
import { useState, FunctionComponent, MouseEvent } from "react";
import {
    DEFAULT_PIANO_ROLL_HEIGHT,
    DEFAULT_PIANO_ROLL_WIDTH,
} from "../constants";
import { BsFillPlayFill, BsPauseFill } from "react-icons/bs";
import { MdDelete, MdOutlineSearch } from "react-icons/md";
import usePlayback from "../hooks/usePlayback";
import { Note, Sequencer } from "../sequencer";
import "./pianoRoll.css";
import PianoRollGrid from "./pianoRollGrid";

interface PianoRollProps {
    noteWidth?: number;
    noteHeight?: number;
    onSubmit: (notes: Note[], gridLength: number) => void;
}

const PianoRoll: FunctionComponent<PianoRollProps> = ({
    noteWidth = DEFAULT_PIANO_ROLL_WIDTH,
    noteHeight = DEFAULT_PIANO_ROLL_HEIGHT,
    onSubmit,
}: PianoRollProps) => {
    const [noteGrid, setNoteGrid] = useState<boolean[][]>(
        Array.from(Array(noteHeight), () => Array(noteWidth).fill(false))
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
            Array.from(Array(noteHeight), () => Array(noteWidth).fill(false))
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

    return (
        <div className="pianoroll">
            <button onClick={handlePlayClick}>
                {isPlaying ? <BsPauseFill /> : <BsFillPlayFill />}
            </button>
            <button
                className="right"
                onClick={() =>
                    onSubmit(
                        Sequencer.transformGridToNotes(noteGrid),
                        noteWidth
                    )
                }
            >
                <MdOutlineSearch />
            </button>
            <button onClick={handleClear}>
                <MdDelete />
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

export default PianoRoll;
