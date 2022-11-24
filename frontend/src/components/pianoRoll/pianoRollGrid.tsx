import * as React from "react";
import { FunctionComponent, useState } from "react";
import "./pianoRoll.css";
import { Note } from "../../sound/sequencer";
import PianoRollCanvas from "./pianoRollCanvas";
import GridParams from "../../interfaces/GridParams";
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

    const handleLeftClick = (coords: MouseEvent) => {
        if (!disabled) mouseHandler.onLeftClick(coords);
    };

    const handleRightClick = (coords: MouseEvent) => {
        if (!disabled) mouseHandler.onRightClick(coords);
    };

    const handleLeftRelease = (coords: MouseEvent) => {
        if (!disabled) mouseHandler.onLeftRelease(coords);
    };

    const handleRightRelease = (coords: MouseEvent) => {
        if (!disabled) mouseHandler.onRightRelease(coords);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!disabled) {
            e.preventDefault();
            if (e.button === 0) {
                handleLeftClick(e.nativeEvent);
            } else if (e.button === 2) {
                handleRightClick(e.nativeEvent);
            }
        }
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!disabled) {
            if (e.button === 0) {
                handleLeftRelease(e.nativeEvent);
            } else if (e.button === 2) {
                handleRightRelease(e.nativeEvent);
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!disabled) {
            mouseHandler.onMouseMove(e.nativeEvent);
        }
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
