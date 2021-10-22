import * as React from "react";
import { useState, FunctionComponent, MouseEvent } from "react";
import {
    DEFAULT_PIANO_ROLL_HEIGHT,
    DEFAULT_PIANO_ROLL_WIDTH,
} from "../constants";
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
                {isPlaying ? "Stop" : "Play"}
            </button>
            <button onClick={handleClear}>Clear</button>
            <PianoRollGrid
                onMouseDown={handleClick}
                onRightClick={handleRightClick}
                onMouseOver={handleMouseOver}
                noteWidth={noteWidth}
                noteHeight={noteHeight}
                noteGrid={noteGrid}
            />
            <button
                onClick={() =>
                    onSubmit(
                        Sequencer.transformGridToNotes(noteGrid),
                        noteWidth
                    )
                }
            >
                Submit
            </button>
        </div>
    );
};

export default PianoRoll;
