import * as React from "react";
import { FunctionComponent, useEffect, useRef, useState } from "react";
import { Note, Sequencer } from "../../sound/sequencer";
import PianoRollCanvas from "./pianoRollCanvas";
import GridParams from "../../interfaces/GridParams";
import { useMouseHandler } from "./mouseHandler";
import { usePianoRollStore } from "../../stores/pianoRollStore";
import { PIANO_ROLL_NOTE_HEIGHT } from "../../constants";

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
    const [alreadyScrolled, setAlreadyScrolled] = useState(false);
    const canvasContainerRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        // Scroll to the first note and center it on screen
        if (canvasContainerRef.current && !alreadyScrolled) {
            setAlreadyScrolled(true);
            let scrollPos = canvasContainerRef.current.clientHeight / 2;
            if (notes.length > 0) {
                const rollHeight = Sequencer.tonePitchToRollPitch(
                    notes[0].pitch,
                    gridParams.lowestNote,
                    gridParams.height
                );
                scrollPos =
                    (rollHeight + 1) * PIANO_ROLL_NOTE_HEIGHT -
                    canvasContainerRef.current.clientHeight / 2;
            }
            canvasContainerRef.current.scroll({
                top: scrollPos,
            });
        }
    }, [alreadyScrolled, notes, gridParams.lowestNote, gridParams.height]);

    return (
        <div
            id="roll-canvas"
            ref={canvasContainerRef}
            className="z-0 flex h-[70vh] max-w-[90vw] justify-start overflow-scroll rounded border-2 border-dark-primary"
        >
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
