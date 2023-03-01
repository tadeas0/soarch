import { Note } from "../../../interfaces/Note";
import {
    getEndRollCoords,
    getStartRollCoords,
} from "../../../common/coordConversion";
import {
    PIANO_ROLL_HANDLE_PART,
    PIANO_ROLL_NOTE_HEIGHT,
    PIANO_ROLL_NOTE_WIDTH,
} from "../../../constants";
import GridParams from "../../../interfaces/GridParams";
import { MouseCoords } from "../../../interfaces/MouseCoords";
import RollCoordinates from "../../../interfaces/RollCoordinates";

const cmpRollCoords = (
    coords1: RollCoordinates,
    coords2: RollCoordinates
): boolean => coords1.row === coords2.row && coords1.column === coords2.column;

export const getRollCoordsFromMouseCoords = (
    coords: MouseCoords
): RollCoordinates => {
    const { offsetX, offsetY } = coords;
    return {
        row: Math.floor(offsetY / PIANO_ROLL_NOTE_HEIGHT),
        column: Math.floor(offsetX / PIANO_ROLL_NOTE_WIDTH),
    };
};

export const getNotesAt = (
    coords: MouseCoords,
    notes: Note[],
    gridParams: GridParams
): Note[] => {
    const c = getRollCoordsFromMouseCoords(coords);
    return notes.filter((n) => {
        const s = getStartRollCoords(n, gridParams);
        const e = getEndRollCoords(n, gridParams);
        return s.row === c.row && s.column <= c.column && e.column >= c.column;
    });
};

/**
 * Returns note, whose handle is on specified coordinates
 * Returns null if there is no note handle on specified coordinates
 * @param coords coordinates to check
 * @param notes notes for which the coordinates should be checked
 * @returns Note | null
 */
export const getNoteHandle = (
    coords: MouseCoords,
    notes: Note[],
    gridParams: GridParams
): Note | null => {
    const { offsetX } = coords;
    const isHandle =
        offsetX % PIANO_ROLL_NOTE_WIDTH >
        PIANO_ROLL_NOTE_WIDTH * (1 - PIANO_ROLL_HANDLE_PART);
    if (!isHandle) return null;
    const clickedNotes = getNotesAt(coords, notes, gridParams);
    if (clickedNotes.length <= 0) {
        return null;
    }
    const topNote = clickedNotes[clickedNotes.length - 1];
    const endCoords = getEndRollCoords(topNote, gridParams);
    const rollCoords = getRollCoordsFromMouseCoords(coords);
    if (cmpRollCoords(rollCoords, endCoords)) {
        return topNote;
    }
    return null;
};
