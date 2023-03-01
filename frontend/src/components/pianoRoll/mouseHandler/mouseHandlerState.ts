/* eslint-disable @typescript-eslint/no-use-before-define */
import {
    getStartRollCoords,
    rollCoordsToTone,
    rollTimeToToneTime,
    toneTimeToRollTime,
} from "../../../common/coordConversion";
import { DEFAULT_NOTE_LENGTH } from "../../../constants";
import { MouseCoords } from "../../../interfaces/MouseCoords";
import { Note } from "../../../interfaces/Note";
import {
    getNoteHandle,
    getNotesAt,
    getRollCoordsFromMouseCoords,
} from "./mouseHandlerHelpers";
import * as Tone from "tone";
import { clamp } from "../../../common/common";
import RollCoordinates from "../../../interfaces/RollCoordinates";
import GridParams from "../../../interfaces/GridParams";

export interface PianoRollData {
    onAddNote: (note: Note) => void;
    onDeleteNote: (note: Note) => void;
    onPreviewNote: (note: Note) => void;
    onSaveState: (note: Note[]) => void;
    onSelectNote: (note: Note | null) => void;
    notes: Note[];
    gridParams: GridParams;
}

interface State {
    handleLeftClick: (coords: MouseCoords, rollData: PianoRollData) => State;
    handleRightClick: (coords: MouseCoords, rollData: PianoRollData) => State;
    handleLeftRelease: (coords: MouseCoords, rollData: PianoRollData) => State;
    handleRightRelease: (
        coords: MouseCoords,
        stateData: PianoRollData
    ) => State;
    handleMouseMove: (coords: MouseCoords, rollData: PianoRollData) => State;
}

const ChangingLengthState = (selectedNote: Note): State => ({
    handleLeftClick: () => ChangingLengthState(selectedNote),
    handleRightClick: () => ChangingLengthState(selectedNote),
    handleLeftRelease: () => ReadyState(selectedNote),
    handleRightRelease: () => ChangingLengthState(selectedNote),
    handleMouseMove: (coords: MouseCoords, rollData: PianoRollData) => {
        const oldNote = selectedNote;

        const start = toneTimeToRollTime(oldNote.time);
        const rollCoords = getRollCoordsFromMouseCoords(coords);
        const newLen = Math.max(1, rollCoords.column - start + 1);
        const newNote: Note = {
            length: rollTimeToToneTime(newLen),
            pitch: oldNote.pitch,
            time: oldNote.time,
        };
        rollData.onAddNote(newNote);
        rollData.onDeleteNote(oldNote);
        return ChangingLengthState(newNote);
    },
});
const DeletingState: State = {
    handleLeftClick: () => DeletingState,
    handleRightClick: () => DeletingState,
    handleLeftRelease: () => DeletingState,
    handleRightRelease: () => ReadyState(null),
    handleMouseMove: (coords: MouseCoords, rollData: PianoRollData) => {
        const n = getNotesAt(coords, rollData.notes, rollData.gridParams);
        if (n.length > 0) {
            rollData.onDeleteNote(n[n.length - 1]);
        }
        return DeletingState;
    },
};
const MovingState = (columnOffset: number, selectedNote: Note): State => ({
    handleLeftClick: () => ReadyState(null),

    handleRightClick: () => MovingState(columnOffset, selectedNote),

    handleLeftRelease: () => ReadyState(selectedNote),

    handleRightRelease: () => MovingState(columnOffset, selectedNote),

    handleMouseMove: (coords: MouseCoords, rollData: PianoRollData) => {
        const { gridParams, onAddNote, onDeleteNote, onSelectNote } = rollData;
        const { row, column } = getRollCoordsFromMouseCoords(coords);
        const { height, width } = gridParams;
        const newColumn = clamp(
            column - columnOffset,
            0,
            width - toneTimeToRollTime(selectedNote.length)
        );
        const newRow = clamp(row, 0, height);
        const newCoords: RollCoordinates = { row: newRow, column: newColumn };
        const noteCoords = rollCoordsToTone(newCoords, gridParams);
        const newNote: Note = { ...noteCoords, length: selectedNote.length };
        onAddNote(newNote);
        onDeleteNote(selectedNote);
        onSelectNote(newNote);
        return MovingState(columnOffset, newNote);
    },
});
export const ReadyState = (lastPreview: Note | null): State => ({
    handleLeftClick: (coords: MouseCoords, rollData: PianoRollData): State => {
        const {
            notes,
            gridParams,
            onAddNote,
            onPreviewNote,
            onSaveState,
            onSelectNote,
        } = rollData;
        onSaveState(notes);
        const n = getNotesAt(coords, notes, gridParams);
        const noteHandle = getNoteHandle(coords, notes, gridParams);
        if (noteHandle !== null) {
            return ChangingLengthState(noteHandle);
        }
        if (n.length > 0) {
            const selectedNote = n.at(-1) as Note;
            const sel = getStartRollCoords(selectedNote, gridParams);
            const rollCoords = getRollCoordsFromMouseCoords(coords);
            const columnOffset = rollCoords.column - sel.column;
            onSelectNote(selectedNote);
            return MovingState(columnOffset, selectedNote);
        }
        const rollCoords = getRollCoordsFromMouseCoords(coords);
        const len = Math.min(
            DEFAULT_NOTE_LENGTH,
            gridParams.width - rollCoords.column
        );
        const newNote: Note = {
            time: rollTimeToToneTime(rollCoords.column),
            pitch: Tone.Frequency(gridParams.lowestNote).transpose(
                gridParams.height - rollCoords.row - 1
            ),
            length: rollTimeToToneTime(len),
        };
        onPreviewNote(newNote);
        onAddNote(newNote);
        return MovingState(0, newNote);
    },

    handleRightClick: (coords: MouseCoords, rollData: PianoRollData) => {
        const { notes, gridParams, onDeleteNote, onSaveState } = rollData;
        onSaveState(notes);
        const n = getNotesAt(coords, notes, gridParams);
        if (n.length > 0) {
            onDeleteNote(n[n.length - 1]);
        }
        return DeletingState;
    },

    handleLeftRelease: () => ReadyState(lastPreview),
    handleRightRelease: () => ReadyState(lastPreview),
    handleMouseMove: (coords: MouseCoords, rollData: PianoRollData) => {
        const { onPreviewNote, notes, gridParams } = rollData;
        const n = getNotesAt(coords, notes, gridParams);
        if (n.length === 0) {
            return ReadyState(null);
        }
        if (lastPreview !== n[n.length - 1]) {
            onPreviewNote(n[n.length - 1]);
        }
        return ReadyState(n[n.length - 1]);
    },
});
