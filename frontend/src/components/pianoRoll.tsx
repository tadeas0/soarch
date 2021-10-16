import * as React from "react";
import { useState, FunctionComponent, MouseEvent } from "react";
import * as Tone from "tone";
import {
    DEFAULT_PIANO_ROLL_HEIGHT,
    DEFAULT_PIANO_ROLL_WIDTH,
    PIANO_ROLL_LOWEST_NOTE,
} from "../constants";
import usePlayback from "../hooks/usePlayback";
import Sequencer from "../sequencer";
import "./pianoRoll.css";

interface PianoRollProps {
    noteWidth?: number;
    noteHeight?: number;
}

const PianoRoll: FunctionComponent<PianoRollProps> = ({
    noteWidth = DEFAULT_PIANO_ROLL_WIDTH,
    noteHeight = DEFAULT_PIANO_ROLL_HEIGHT,
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
        e: MouseEvent<HTMLTableCellElement>,
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

    const renderNotes = () => {
        let rows = noteGrid.map((row, ri) => {
            const entry = row.map((i, ci) => (
                <td
                    className={i ? "active" : "inactive"}
                    onMouseDown={() => handleClick(ri, ci)}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        handleRightClick(ri, ci);
                    }}
                    onMouseOver={(e) => handleMouseOver(e, ri, ci)}
                ></td>
            ));
            return (
                <tr className={isBlackKey(ri) ? "blackkey" : "whitekey"}>
                    {entry}
                </tr>
            );
        });

        return rows;
    };

    const isBlackKey = (row: number) => {
        return Tone.Frequency(PIANO_ROLL_LOWEST_NOTE)
            .transpose(noteHeight - row - 1)
            .toNote()
            .includes("#");
    };

    return (
        <div className="pianoroll">
            <button onClick={handlePlayClick}>
                {isPlaying ? "Stop" : "Play"}
            </button>
            <button onClick={handleClear}>Clear</button>
            <table>
                <tbody>{renderNotes()}</tbody>
            </table>
        </div>
    );
};

export default PianoRoll;
