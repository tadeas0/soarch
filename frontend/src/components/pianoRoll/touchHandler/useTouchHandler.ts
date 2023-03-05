import { useRef, useState } from "react";
import { Note } from "../../../interfaces/Note";
import GridParams from "../../../interfaces/GridParams";
import { MouseCoords } from "../../../interfaces/MouseCoords";
import { PianoRollTouchData, ReadyState } from "./touchHandlerState";
import { DEFAULT_NOTE_LENGTH } from "../../../constants";

const useTouchHandler = (
    onAddNote: (note: Note) => void,
    onDeleteNote: (note: Note) => void,
    onPreviewNote: (note: Note) => void,
    onSelectNote: (note: Note | null) => void,
    onSaveState: (notes: Note[]) => void,
    notes: Note[],
    gridParams: GridParams
) => {
    const currentState = useRef(ReadyState());
    const [preventScroll, setPreventScroll] = useState(false);
    const [newNoteLen, setNewNoteLen] = useState(DEFAULT_NOTE_LENGTH);

    const stateData: PianoRollTouchData = {
        onAddNote,
        onDeleteNote,
        onPreviewNote,
        onSelectNote,
        onSaveState,
        onSetPreventScroll: setPreventScroll,
        setNewNoteLen,
        newNoteLen,
        notes,
        gridParams,
    };

    const onTouchStart = (coords: MouseCoords) => {
        const newState = currentState.current.handleTouchStart(
            coords,
            stateData
        );
        currentState.current = newState;
    };

    const onTouchEnd = () => {
        const newState = currentState.current.handleTouchEnd(stateData);
        currentState.current = newState;
    };

    const onTouchMove = (coords: MouseCoords) => {
        const newState = currentState.current.handleTouchMove(
            coords,
            stateData
        );
        currentState.current = newState;
    };

    const onTouchCancel = () => {
        currentState.current = ReadyState();
    };

    return {
        onTouchStart,
        onTouchEnd,
        onTouchCancel,
        onTouchMove,
        preventScroll,
    };
};

export default useTouchHandler;
