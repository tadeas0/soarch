import * as React from "react";
import { FunctionComponent, useRef, useState } from "react";
import { Note } from "../../sound/sequencer";
import PianoRollCanvas from "./pianoRollCanvas";
import GridParams from "../../interfaces/GridParams";
import { useMouseHandler } from "./mouseHandler/mouseHandler";
import { usePianoRollStore } from "../../stores/pianoRollStore";
import { PREVIEW_NOTE_HIGHLIGHT_DURATION } from "../../constants";
import { SearchResult } from "../../interfaces/SearchResult";

interface PianoRollGridProps {
    notes: Note[];
    gridParams: GridParams;
    topSearchResult?: SearchResult;
    disabled?: boolean;
}

// TODO: cleanup event handling
const PianoRollGrid: FunctionComponent<PianoRollGridProps> = ({
    notes,
    gridParams,
    topSearchResult,
    disabled = false,
}: PianoRollGridProps) => {
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [previewNotes, setPreviewNotes] = useState<Map<Note, number>>(
        new Map()
    );
    const [playbackEnabled, isRollPlaying] = usePianoRollStore((state) => [
        state.playbackEnabled,
        state.isRollPlaying,
    ]);
    const canvasContainerRef = useRef<HTMLDivElement>(null);

    const handleShowPreviewNote = async (note: Note) => {
        setPreviewNotes((current) => {
            const currentTimeout = current.get(note);
            if (currentTimeout) {
                clearTimeout(currentTimeout);
            }
            const i = setTimeout(() => {
                setPreviewNotes((next) => {
                    const s = new Map(next);
                    s.delete(note);
                    return s;
                });
            }, PREVIEW_NOTE_HIGHLIGHT_DURATION);
            return new Map(current.set(note, i));
        });
    };

    const mouseHandler = useMouseHandler(
        usePianoRollStore.getState().addNote,
        usePianoRollStore.getState().deleteNote,
        setSelectedNote,
        handleShowPreviewNote,
        () =>
            usePianoRollStore.getState().songs[
                usePianoRollStore.getState().selectedIndex
            ].notes,
        gridParams,
        playbackEnabled,
        usePianoRollStore.getState().saveState
    );

    const handleLeftClick = async (coords: MouseEvent) => {
        if (!disabled) mouseHandler.onLeftClick(coords);
    };

    const handleRightClick = async (coords: MouseEvent) => {
        if (!disabled) mouseHandler.onRightClick(coords);
    };

    const handleLeftRelease = async (coords: MouseEvent) => {
        if (!disabled) mouseHandler.onLeftRelease(coords);
    };

    const handleRightRelease = async (coords: MouseEvent) => {
        if (!disabled) mouseHandler.onRightRelease(coords);
    };

    const handleMouseDown = async (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!disabled) {
            e.preventDefault();
            if (e.button === 0) {
                handleLeftClick(e.nativeEvent);
            } else if (e.button === 2) {
                handleRightClick(e.nativeEvent);
            }
        }
    };

    const handleMouseUp = async (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!disabled) {
            if (e.button === 0) {
                handleLeftRelease(e.nativeEvent);
            } else if (e.button === 2) {
                handleRightRelease(e.nativeEvent);
            }
        }
    };

    const handleMouseMove = async (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!disabled) {
            mouseHandler.onMouseMove(e.nativeEvent);
        }
    };

    return (
        <div
            id="roll-canvas"
            ref={canvasContainerRef}
            className="relative z-0 flex h-[70vh] max-w-[90vw] justify-start rounded border-2 border-dark-primary"
        >
            <PianoRollCanvas
                gridParams={gridParams}
                topSearchResult={topSearchResult}
                notes={notes}
                selectedNote={selectedNote}
                previewNotes={new Set(previewNotes.keys())}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                disabled={disabled || !isRollPlaying}
            />
        </div>
    );
};

PianoRollGrid.defaultProps = {
    topSearchResult: undefined,
    disabled: false,
};

export default PianoRollGrid;
