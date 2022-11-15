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

export interface GridParams {
    width: number;
    height: number;
    lowestNote: Tone.Unit.Note;
}

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

    const isNoteHandle = (ri: number, ci: number) => {
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
        return noteEnds.findIndex((n) => n[0] === ri && n[1] === ci) !== -1;
    };

    const getNotesAt = (ri: number, ci: number): Note[] =>
        notes.filter((n) => {
            const s = Sequencer.toneTimeToRollTime(n.time);
            const e = s + Sequencer.toneTimeToRollTime(n.length);
            const p = Sequencer.tonePitchToRollPitch(
                n.pitch,
                gridParams.lowestNote,
                gridParams.height
            );
            return p === ri && s <= ci && e > ci;
        });

    const deleteByCoordinates = (ri: number, ci: number) => {
        const notes = getNotesAt(ri, ci);
        if (notes.length > 0) onDeleteNote(notes[notes.length - 1]);
    };

    const handleLeftClick = (ri: number, ci: number) => {
        if (isNoteHandle(ri, ci) && currentDrawState === DrawState.NOTHING) {
            setCurrentDrawState(DrawState.EDITING);
        } else {
            const newNote = {
                time: Sequencer.rollTimeToToneTime(ci),
                pitch: Tone.Frequency(gridParams.lowestNote)
                    .transpose(gridParams.height - ri - 1)
                    .toNote(),
                length: Sequencer.rollTimeToToneTime(DEFAULT_NOTE_LENGTH),
            };
            onAddNote(newNote);
            setCurrentDrawState(DrawState.DRAWING);
        }
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const { offsetX, offsetY } = e.nativeEvent;
        const [ri, ci] = getCoordsAtOffset(offsetX, offsetY);
        if (ri >= 0) {
            if (e.button === 0) {
                handleLeftClick(ri, ci);
            } else if (e.button === 2) {
                deleteByCoordinates(ri, ci);
                setCurrentDrawState(DrawState.DELETING);
            }
        }
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (e.button === 0 && currentDrawState === DrawState.DRAWING) {
            setCurrentDrawState(DrawState.NOTHING);
        } else if (e.button === 2 && currentDrawState === DrawState.DELETING) {
            setCurrentDrawState(DrawState.NOTHING);
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const { offsetX, offsetY } = e.nativeEvent;
        const [ri, ci] = getCoordsAtOffset(offsetX, offsetY);
        if (currentDrawState === DrawState.DELETING) {
            deleteByCoordinates(ri, ci);
        }
    };

    const getCoordsAtOffset = (offsetX: number, offsetY: number) => {
        return [
            Math.floor(
                (offsetY - PIANO_ROLL_HEADER_SIZE) / PIANO_ROLL_NOTE_HEIGHT
            ),
            Math.floor(offsetX / PIANO_ROLL_NOTE_WIDTH),
        ];
    };

    return (
        <div className="table-container">
            <PianoRollCanvas
                gridParams={gridParams}
                notes={notes}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            />
        </div>
    );
};

export default PianoRollGrid;
