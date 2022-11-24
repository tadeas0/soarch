import * as React from "react";
import { FunctionComponent, useState } from "react";
import "./pianoRoll.css";
import {
    PIANO_ROLL_HEADER_SIZE,
    PIANO_ROLL_NOTE_HEIGHT,
    PIANO_ROLL_NOTE_WIDTH,
} from "../../constants";
import { Note } from "../../sound/sequencer";
import PianoRollCanvas from "./pianoRollCanvas";
import GridParams from "../../interfaces/GridParams";
import RollCoordinates from "../../interfaces/RollCoordinates";
import { useMouseHandler } from "./mouseHandler";
import { usePianoRollStore } from "../../stores/pianoRollStore";

interface PianoRollGridProps {
    notes: Note[];
    gridParams: GridParams;
    disabled?: boolean;
    disabledHeader?: boolean;
}

// TODO: cleanup event handling
const PianoRollGrid: FunctionComponent<PianoRollGridProps> = ({
    notes,
    gridParams,
    disabled = false,
    disabledHeader = false,
}: PianoRollGridProps) => {
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const playbackEnabled = usePianoRollStore((state) => state.playbackEnabled);

    const mouseHandler = useMouseHandler(
        usePianoRollStore.getState().addNote,
        usePianoRollStore.getState().deleteNote,
        setSelectedNote,
        () =>
            usePianoRollStore.getState().songs[
                usePianoRollStore.getState().selectedIndex
            ].notes,
        gridParams,
        playbackEnabled
    );

    const handleLeftClick = (coords: RollCoordinates) => {
        if (!disabled) mouseHandler.onLeftClick(coords);
    };

    const handleRightClick = (coords: RollCoordinates) => {
        if (!disabled) mouseHandler.onRightClick(coords);
    };

    const handleLeftRelease = (coords: RollCoordinates) => {
        if (!disabled) mouseHandler.onLeftRelease(coords);
    };

    const handleRightRelease = (coords: RollCoordinates) => {
        if (!disabled) mouseHandler.onRightRelease(coords);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!disabled) {
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
        }
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!disabled) {
            const { offsetX, offsetY } = e.nativeEvent;
            const coords = getCoordsAtOffset(offsetX, offsetY);
            if (e.button === 0) {
                handleLeftRelease(coords);
            } else if (e.button === 2) {
                handleRightRelease(coords);
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!disabled) {
            const { offsetX, offsetY } = e.nativeEvent;
            const coords = getCoordsAtOffset(offsetX, offsetY);
            mouseHandler.onMouseMove(coords);
        }
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
                disabled={disabled}
                disabledHeader={disabledHeader}
            />
        </div>
    );
};

export default PianoRollGrid;
