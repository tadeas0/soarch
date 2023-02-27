import * as React from "react";
import { FunctionComponent, useEffect, useRef, useState } from "react";
import { Note } from "../../interfaces/Note";
import PianoRollCanvas from "./pianoRollCanvas";
import GridParams from "../../interfaces/GridParams";
import useMouseHandler from "./mouseHandler/useMouseHandler";
import { usePianoRollStore } from "../../stores/pianoRollStore";
import { PREVIEW_NOTE_HIGHLIGHT_DURATION } from "../../constants";
import { Sequencer } from "../../hooks/sequencer/useSequencer";
import useSynth from "../../hooks/sequencer/useSynth";
import useSearchResultQuery from "../../hooks/useSearchResultQuery";

interface PianoRollGridProps {
    notes: Note[];
    gridParams: GridParams;
    rollSequencer: Sequencer;
    disabled?: boolean;
}

// TODO: cleanup event handling
const PianoRollGrid: FunctionComponent<PianoRollGridProps> = ({
    notes,
    gridParams,
    rollSequencer,
    disabled = false,
}: PianoRollGridProps) => {
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [previewNotes, setPreviewNotes] = useState<Map<Note, number>>(
        new Map()
    );
    const invalidateSearchResults = useSearchResultQuery();
    const [localNotes, setLocalNotes] = useState<Note[]>([]);
    const [setNotesStore, saveStateStore] = usePianoRollStore((state) => [
        state.setNotes,
        state.saveState,
    ]);
    const { triggerAttackRelease } = useSynth();
    const canvasContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setLocalNotes(notes);
    }, [notes]);

    const onPreviewNote = async (note: Note) => {
        triggerAttackRelease(note.pitch);
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

    const addNote = (note: Note) => {
        setLocalNotes((current) => [...current, note]);
        rollSequencer.addNote(note);
    };

    const deleteNote = (note: Note) => {
        setLocalNotes((current) => current.filter((n) => n !== note));
        rollSequencer.deleteNote(note);
    };

    const mouseHandler = useMouseHandler(
        addNote,
        deleteNote,
        onPreviewNote,
        setSelectedNote,
        saveStateStore,
        localNotes,
        gridParams
    );

    const handleLeftClick = async (coords: MouseEvent) => {
        if (!disabled) mouseHandler.onLeftClick(coords);
    };

    const handleRightClick = async (coords: MouseEvent) => {
        if (!disabled) mouseHandler.onRightClick(coords);
    };

    const handleLeftRelease = async (coords: MouseEvent) => {
        if (!disabled) {
            mouseHandler.onLeftRelease(coords);
            setNotesStore(localNotes);
            invalidateSearchResults();
        }
    };

    const handleRightRelease = async (coords: MouseEvent) => {
        if (!disabled) {
            mouseHandler.onRightRelease(coords);
            setNotesStore(localNotes);
            invalidateSearchResults();
        }
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

    const handleDoubleClick = async (
        e: React.MouseEvent<HTMLCanvasElement>
    ) => {
        mouseHandler.onRightClick(e.nativeEvent);
        mouseHandler.onRightRelease(e.nativeEvent);
    };

    return (
        <div
            id="roll-canvas"
            ref={canvasContainerRef}
            className="relative z-0 flex h-[70vh] max-w-[90vw] justify-start rounded border-2 border-dark-primary"
        >
            <PianoRollCanvas
                gridParams={gridParams}
                notes={localNotes}
                selectedNote={selectedNote}
                previewNotes={new Set(previewNotes.keys())}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onDoubleClick={handleDoubleClick}
                rollSequencer={rollSequencer}
            />
        </div>
    );
};

PianoRollGrid.defaultProps = {
    disabled: false,
};

export default PianoRollGrid;
