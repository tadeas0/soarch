import { useRef, useState } from "react";
import { DEFAULT_NOTE_LENGTH } from "../../../constants";
import GridParams from "../../../interfaces/GridParams";
import { MouseCoords } from "../../../interfaces/MouseCoords";
import { Note } from "../../../interfaces/Note";
import { PianoRollData, ReadyState } from "./mouseHandlerState";

const useMouseHandler = (
    onAddNote: (note: Note) => void,
    onDeleteNote: (note: Note) => void,
    onPreviewNote: (note: Note) => void,
    onSelectNote: (note: Note | null) => void,
    onSaveState: (notes: Note[]) => void,
    onSetCursor: (cursor: string) => void,
    notes: Note[],
    gridParams: GridParams
) => {
    const currentState = useRef(ReadyState(null));
    const [newNoteLen, setNewNoteLen] = useState(DEFAULT_NOTE_LENGTH);

    const stateData: PianoRollData = {
        onAddNote,
        onDeleteNote,
        onPreviewNote,
        onSelectNote,
        onSaveState,
        setNewNoteLen,
        onSetCursor,
        newNoteLen,
        notes,
        gridParams,
    };

    const onLeftClick = (coords: MouseCoords) => {
        const nextState = currentState.current.handleLeftClick(
            coords,
            stateData
        );
        currentState.current = nextState;
    };

    const onLeftRelease = (coords: MouseCoords) => {
        const nextState = currentState.current.handleLeftRelease(
            coords,
            stateData
        );
        currentState.current = nextState;
    };

    const onRightClick = (coords: MouseCoords) => {
        const nextState = currentState.current.handleRightClick(
            coords,
            stateData
        );
        currentState.current = nextState;
    };

    const onRightRelease = (coords: MouseCoords) => {
        const nextState = currentState.current.handleRightRelease(
            coords,
            stateData
        );
        currentState.current = nextState;
    };

    const onMouseMove = (coords: MouseCoords) => {
        const nextState = currentState.current.handleMouseMove(
            coords,
            stateData
        );
        currentState.current = nextState;
    };

    return {
        onLeftClick,
        onLeftRelease,
        onRightClick,
        onRightRelease,
        onMouseMove,
    };
};

export default useMouseHandler;
