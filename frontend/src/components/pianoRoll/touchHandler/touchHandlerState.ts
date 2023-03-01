/* eslint-disable @typescript-eslint/no-use-before-define */
import { clamp } from "../../../common/common";
import {
    getStartRollCoords,
    rollCoordsToTone,
    rollTimeToToneTime,
    toneTimeToRollTime,
} from "../../../common/coordConversion";
import { DEFAULT_NOTE_LENGTH } from "../../../constants";
import GridParams from "../../../interfaces/GridParams";
import { MouseCoords } from "../../../interfaces/MouseCoords";
import { Note } from "../../../interfaces/Note";
import RollCoordinates from "../../../interfaces/RollCoordinates";
import {
    getNoteHandle,
    getNotesAt,
    getRollCoordsFromMouseCoords,
} from "../mouseHandler/mouseHandlerHelpers";

export interface PianoRollTouchData {
    onAddNote: (note: Note) => void;
    onDeleteNote: (note: Note) => void;
    onPreviewNote: (note: Note) => void;
    onSaveState: (note: Note[]) => void;
    onSelectNote: (note: Note | null) => void;
    onSetPreventScroll: (val: boolean) => void;
    notes: Note[];
    gridParams: GridParams;
}

interface TouchState {
    handleTouchMove: (
        coords: MouseCoords,
        rollData: PianoRollTouchData
    ) => TouchState;
    handleTouchStart: (
        coords: MouseCoords,
        rollData: PianoRollTouchData
    ) => TouchState;
    handleTouchEnd: (rollData: PianoRollTouchData) => TouchState;
}

export const ReadyState = (): TouchState => ({
    handleTouchMove: () => ReadyState(),
    handleTouchStart: (coords: MouseCoords, rollData: PianoRollTouchData) => {
        const { notes, gridParams, onSetPreventScroll, onSaveState } = rollData;
        const n = getNotesAt(coords, notes, gridParams);
        const handle = getNoteHandle(coords, notes, gridParams);
        if (handle !== null) {
            onSaveState(notes);
            onSetPreventScroll(true);
            return ChangingLengthState(handle);
        }
        if (n.length > 0) {
            onSaveState(notes);
            const selectedNote = n.at(-1)!;
            const sel = getStartRollCoords(selectedNote, gridParams);
            const rollCoords = getRollCoordsFromMouseCoords(coords);
            const columnOffset = rollCoords.column - sel.column;
            onSetPreventScroll(true);
            return MovingState(coords, selectedNote, columnOffset);
        }
        return CreatingState(coords);
    },

    handleTouchEnd: () => ReadyState(),
});

export const CreatingState = (startCoords: MouseCoords): TouchState => ({
    handleTouchMove: (coords: MouseCoords, rollData: PianoRollTouchData) => {
        rollData.onSetPreventScroll(false);
        return ReadyState();
    },

    handleTouchStart: (coords: MouseCoords, rollData: PianoRollTouchData) => {
        rollData.onSetPreventScroll(false);
        return ReadyState();
    },

    handleTouchEnd: (rollData: PianoRollTouchData) => {
        const {
            onAddNote,
            gridParams,
            onSetPreventScroll,
            onPreviewNote,
            onSaveState,
            onSelectNote,
            notes,
        } = rollData;
        onSaveState(notes);
        const rollCoords = getRollCoordsFromMouseCoords(startCoords);
        const toneCoords = rollCoordsToTone(rollCoords, gridParams);
        const len = Math.min(
            DEFAULT_NOTE_LENGTH,
            gridParams.width - rollCoords.column
        );
        const newNote = { ...toneCoords, length: rollTimeToToneTime(len) };
        onPreviewNote(newNote);
        onAddNote(newNote);
        onSelectNote(newNote);
        onSetPreventScroll(false);
        return ReadyState();
    },
});

export const MovingState = (
    startCoords: MouseCoords,
    selectedNote: Note,
    columnOffset: number,
    moved: boolean = false
): TouchState => ({
    handleTouchMove: (coords: MouseCoords, rollData: PianoRollTouchData) => {
        const { gridParams, onAddNote, onDeleteNote, onSelectNote } = rollData;
        const { row, column } = getRollCoordsFromMouseCoords(coords);
        const { height, width } = gridParams;
        const newColumn = clamp(
            column - columnOffset,
            0,
            width - toneTimeToRollTime(selectedNote.length)
        );
        const newRow = clamp(row, 0, height);
        const newCoords: RollCoordinates = {
            row: newRow,
            column: newColumn,
        };
        const noteCoords = rollCoordsToTone(newCoords, gridParams);
        const newNote: Note = {
            ...noteCoords,
            length: selectedNote.length,
        };
        onAddNote(newNote);
        onDeleteNote(selectedNote);
        onSelectNote(newNote);
        return MovingState(startCoords, newNote, columnOffset, true);
    },
    handleTouchStart: () => ReadyState(),
    handleTouchEnd: (rollData: PianoRollTouchData) => {
        const { onSetPreventScroll, onDeleteNote, onSaveState, notes } =
            rollData;
        if (!moved) {
            onSaveState(notes);
            onDeleteNote(selectedNote);
        }
        onSetPreventScroll(false);
        return ReadyState();
    },
});

export const ChangingLengthState = (selectedNote: Note): TouchState => ({
    handleTouchMove: (coords: MouseCoords, rollData: PianoRollTouchData) => {
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
        rollData.onSelectNote(newNote);
        return ChangingLengthState(newNote);
    },
    handleTouchStart: (coords: MouseCoords, rollState: PianoRollTouchData) => {
        rollState.onSetPreventScroll(false);
        return ReadyState();
    },
    handleTouchEnd: (rollState: PianoRollTouchData) => {
        rollState.onSetPreventScroll(false);
        return ReadyState();
    },
});
