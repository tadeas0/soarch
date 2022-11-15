import * as React from "react";
import { FunctionComponent, useState } from "react";
import "./pianoRoll.css";
import * as Tone from "tone";
import {
    DEFAULT_NOTE_LENGTH,
    PIANO_ROLL_HEADER_SIZE,
    PIANO_ROLL_NOTE_HEIGHT,
    PIANO_ROLL_NOTE_WIDTH,
} from "../../constants";
import { Sequencer, Note } from "../../sequencer";
import PianoRollCanvas from "./pianoRollCanvas";
import GridParams from "../../interfaces/GridParams";
import RollCoordinates from "../../interfaces/RollCoordinates";

interface PianoRollGridProps {
    notes: Note[];
    gridParams: GridParams;
    onDeleteNote?: (note: Note) => void;
    onAddNote?: (note: Note) => void;
}

enum DrawState {
    DRAWING,
    DELETING,
    EDITING,
    NOTHING,
}

// TODO: cleanup event handling
const PianoRollGrid: FunctionComponent<PianoRollGridProps> = ({
    notes,
    gridParams,
    onAddNote = (note: Note) => {},
    onDeleteNote = (note: Note) => {},
}: PianoRollGridProps) => {
    const [currentDrawState, setCurrentDrawState] = useState<DrawState>(
        DrawState.NOTHING
    );
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);

    const isNoteHandle = (coords: RollCoordinates) => {
        const noteEnds = notes.map((n) => [
            Sequencer.tonePitchToRollPitch(
                n.pitch,
                gridParams.lowestNote,
                gridParams.height
            ),
            Sequencer.toneTimeToRollTime(n.time) +
                Sequencer.toneTimeToRollTime(n.length) -
                1,
        ]);
        return (
            noteEnds.findIndex(
                (n) => n[0] === coords.row && n[1] === coords.column
            ) !== -1
        );
    };

    const getNotesAt = (coords: RollCoordinates): Note[] =>
        notes.filter((n) => {
            const s = Sequencer.toneTimeToRollTime(n.time);
            const e = s + Sequencer.toneTimeToRollTime(n.length);
            const p = Sequencer.tonePitchToRollPitch(
                n.pitch,
                gridParams.lowestNote,
                gridParams.height
            );
            return p === coords.row && s <= coords.column && e > coords.column;
        });

    const deleteByCoordinates = (coords: RollCoordinates) => {
        const notes = getNotesAt(coords);
        if (notes.length > 0) onDeleteNote(notes[notes.length - 1]);
    };

    const handleLeftClick = (coords: RollCoordinates) => {
        const n = getNotesAt(coords);
        if (isNoteHandle(coords) && currentDrawState === DrawState.NOTHING) {
            setCurrentDrawState(DrawState.EDITING);
        } else if (
            n.length > 0 &&
            currentDrawState === DrawState.NOTHING &&
            n.findIndex((s) => s === selectedNote) !== -1
        ) {
            setSelectedNote(null);
        } else if (n.length > 0 && currentDrawState === DrawState.NOTHING) {
            setSelectedNote(n[n.length - 1]);
        } else {
            const newNote = {
                time: Sequencer.rollTimeToToneTime(coords.column),
                pitch: Tone.Frequency(gridParams.lowestNote)
                    .transpose(gridParams.height - coords.row - 1)
                    .toNote(),
                length: Sequencer.rollTimeToToneTime(DEFAULT_NOTE_LENGTH),
            };
            onAddNote(newNote);
            setCurrentDrawState(DrawState.DRAWING);
        }
    };

    const handleRightClick = (coords: RollCoordinates) => {
        deleteByCoordinates(coords);
        setCurrentDrawState(DrawState.DELETING);
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
        if (
            e.button === 0 &&
            (currentDrawState === DrawState.DRAWING ||
                currentDrawState === DrawState.EDITING)
        ) {
            setCurrentDrawState(DrawState.NOTHING);
        } else if (e.button === 2 && currentDrawState === DrawState.DELETING) {
            setCurrentDrawState(DrawState.NOTHING);
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const { offsetX, offsetY } = e.nativeEvent;
        const coords = getCoordsAtOffset(offsetX, offsetY);
        if (currentDrawState === DrawState.DELETING) {
            deleteByCoordinates(coords);
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
            />
        </div>
    );
};

export default PianoRollGrid;
