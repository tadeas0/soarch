import * as React from "react";
import { FunctionComponent, useState } from "react";
import "./pianoRoll.css";
import {
    PIANO_ROLL_HEADER_SIZE,
    PIANO_ROLL_NOTE_HEIGHT,
    PIANO_ROLL_NOTE_WIDTH,
} from "../../constants";
import { Note } from "../../sequencer";
import PianoRollCanvas from "./pianoRollCanvas";
import GridParams from "../../interfaces/GridParams";
import RollCoordinates from "../../interfaces/RollCoordinates";
import { useMouseHandler } from "./mouseHandler";

interface PianoRollGridProps {
    notes: Note[];
    gridParams: GridParams;
    onDeleteNote?: (note: Note) => void;
    onAddNote?: (note: Note) => void;
}

// TODO: cleanup event handling
const PianoRollGrid: FunctionComponent<PianoRollGridProps> = ({
    notes,
    gridParams,
    onAddNote = (note: Note) => {},
    onDeleteNote = (note: Note) => {},
}: PianoRollGridProps) => {
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const mouseHandler = useMouseHandler(
        onAddNote,
        onDeleteNote,
        setSelectedNote,
        gridParams
    );

    const handleLeftClick = (coords: RollCoordinates) => {
        mouseHandler.onLeftClick(coords, notes);
    };

    const handleRightClick = (coords: RollCoordinates) => {
        mouseHandler.onRightClick(coords, notes);
    };

    const handleLeftRelease = (coords: RollCoordinates) => {
        mouseHandler.onLeftRelease(coords, notes);
    };

    const handleRightRelease = (coords: RollCoordinates) => {
        mouseHandler.onRightRelease(coords, notes);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const { offsetX, offsetY } = e.nativeEvent;
        const coords = getCoordsAtOffset(offsetX, offsetY);
        if (coords.row >= 0) {
            if (e.button === 0) {
                handleLeftClick(coords);
            } else if (e.button === 2) {
                handleRightClick(coords);
            }
        }
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const { offsetX, offsetY } = e.nativeEvent;
        const coords = getCoordsAtOffset(offsetX, offsetY);
        if (e.button === 0) {
            handleLeftRelease(coords);
        } else if (e.button === 2) {
            handleRightRelease(coords);
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const { offsetX, offsetY } = e.nativeEvent;
        const coords = getCoordsAtOffset(offsetX, offsetY);
        mouseHandler.onMouseMove(coords, notes);
    };

    const getCoordsAtOffset = (
        offsetX: number,
        offsetY: number
    ): RollCoordinates => {
        return {
            row: Math.floor(
                (offsetY - PIANO_ROLL_HEADER_SIZE) / PIANO_ROLL_NOTE_HEIGHT
            ),
            column: Math.floor(offsetX / PIANO_ROLL_NOTE_WIDTH),
        };
    };

    return (
        <div className="table-container">
            <PianoRollCanvas
                gridParams={gridParams}
                notes={notes}
                selectedNote={selectedNote}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            />
        </div>
    );
};

export default PianoRollGrid;
