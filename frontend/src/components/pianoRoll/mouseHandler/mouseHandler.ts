import { useEffect, useRef } from "react";
import * as Tone from "tone";
import {
    PIANO_ROLL_HANDLE_PART,
    PIANO_ROLL_NOTE_HEIGHT,
    PIANO_ROLL_NOTE_WIDTH,
} from "../../../constants";
import GridParams from "../../../interfaces/GridParams";
import RollCoordinates from "../../../interfaces/RollCoordinates";
import { Note } from "../../../interfaces/Note";
// eslint-disable-next-line import/no-cycle
import State from "./handlerState";
// eslint-disable-next-line import/no-cycle
import ReadyState from "./readyState";
import { MouseCoords } from "../../../interfaces/MouseCoords";
import {
    getEndRollCoords,
    getStartRollCoords,
} from "../../../common/coordConversion";

export class MouseHandler {
    private state: State;

    private _gridParams: GridParams;

    private _selectedNote: Note | null;

    private onAddNote: (note: Note) => void;

    private onDeleteNote: (note: Note) => void;

    private changeSelectedNote: (note: Note) => void;

    private getNotes: () => Note[];

    private _previewNote: (note: Note) => void;

    private _playbackEnabled: boolean;

    private _saveState: (notes: Note[]) => void;

    private _pressNote: (note: Tone.FrequencyClass) => void;

    private _releaseNote: (note: Tone.FrequencyClass) => void;

    constructor(
        onAddNote: (note: Note) => void,
        onDeleteNote: (note: Note) => void,
        changeSelectedNote: (note: Note) => void,
        previewNote: (note: Note) => void,
        pressNote: (note: Tone.FrequencyClass) => void,
        releaseNote: (note: Tone.FrequencyClass) => void,
        getNotes: () => Note[],
        gridParams: GridParams,
        playbackEnabled: boolean,
        saveState: (notes: Note[]) => void
    ) {
        this.state = new ReadyState(this);
        this.onAddNote = onAddNote;
        this.onDeleteNote = onDeleteNote;
        this._gridParams = gridParams;
        this.changeSelectedNote = changeSelectedNote;
        this.getNotes = getNotes;
        this._previewNote = previewNote;
        this._playbackEnabled = playbackEnabled;
        this._selectedNote = null;
        this._pressNote = pressNote;
        this._releaseNote = releaseNote;
        this._saveState = saveState;
    }

    public saveState() {
        this._saveState(this.getNotes());
    }

    public getRollCoordsFromMouseCoords(coords: MouseCoords): RollCoordinates {
        const { offsetX, offsetY } = coords;
        return {
            row: Math.floor(offsetY / PIANO_ROLL_NOTE_HEIGHT),
            column: Math.floor(offsetX / PIANO_ROLL_NOTE_WIDTH),
        };
    }

    public get playbackEnabled(): boolean {
        return this._playbackEnabled;
    }

    public set playbackEnabled(value: boolean) {
        this._playbackEnabled = value;
    }

    public getNotesAt(coords: MouseCoords): Note[] {
        const c = this.getRollCoordsFromMouseCoords(coords);
        return this.getNotes().filter((n) => {
            const s = getStartRollCoords(n, this._gridParams);
            const e = getEndRollCoords(n, this._gridParams);
            return (
                s.row === c.row && s.column <= c.column && e.column >= c.column
            );
        });
    }

    /**
     * Returns note, whose handle is on specified coordinates
     * Returns null if there is no note handle on specified coordinates
     * @param coords coordinates to check
     * @param notes notes for which the coordinates should be checked
     * @returns Note | null
     */
    public noteHandle(coords: MouseCoords): Note | null {
        const { offsetX } = coords;
        const isHandle =
            offsetX % PIANO_ROLL_NOTE_WIDTH >
            PIANO_ROLL_NOTE_WIDTH * (1 - PIANO_ROLL_HANDLE_PART);
        if (!isHandle) return null;
        const clickedNotes = this.getNotesAt(coords);
        if (clickedNotes.length <= 0) {
            return null;
        }
        const topNote = clickedNotes[clickedNotes.length - 1];
        const endCoords = getEndRollCoords(topNote, this._gridParams);
        const rollCoords = this.getRollCoordsFromMouseCoords(coords);
        if (this.cmpRollCoords(rollCoords, endCoords)) {
            return topNote;
        }
        return null;
    }

    private cmpRollCoords(
        coords1: RollCoordinates,
        coords2: RollCoordinates
    ): boolean {
        return coords1.row === coords2.row && coords1.column === coords2.column;
    }

    get selectedNote(): Note | null {
        return this._selectedNote;
    }

    public get gridParams(): GridParams {
        return this._gridParams;
    }

    public set gridParams(value: GridParams) {
        this._gridParams = value;
    }

    public previewNote(note: Note) {
        this._previewNote(note);
    }

    public async addNote(note: Note) {
        this.onAddNote(note);
    }

    public async deleteNote(note: Note) {
        this.onDeleteNote(note);
    }

    public selectNote(note: Note) {
        this._selectedNote = note;
        this.changeSelectedNote(note);
    }

    public changeState(state: State) {
        this.state = state;
    }

    public onLeftClick(coords: MouseCoords) {
        this.state.handleLeftClick(coords);
    }

    public onRightClick(coords: MouseCoords) {
        this.state.handleRightClick(coords);
    }

    public onMouseMove(coords: MouseCoords) {
        this.state.handleMouseMove(coords);
    }

    public onLeftRelease(coords: MouseCoords) {
        this.state.handleLeftRelease(coords);
    }

    public onRightRelease(coords: MouseCoords) {
        this.state.handleRightRelease(coords);
    }

    public pressNote(note: Tone.FrequencyClass) {
        if (this.playbackEnabled) this._pressNote(note);
    }

    public releaseNote(note: Tone.FrequencyClass) {
        this._releaseNote(note);
    }
}

export function useMouseHandler(
    onAddNote: (note: Note) => void,
    onDeleteNote: (note: Note) => void,
    setSelectedNote: (note: Note) => void,
    previewNote: (note: Note) => void,
    pressNote: (note: Tone.FrequencyClass) => void,
    releaseNote: (note: Tone.FrequencyClass) => void,
    getNotes: () => Note[],
    gridParams: GridParams,
    playbackEnabled: boolean,
    saveState: (notes: Note[]) => void = () => {}
) {
    const mouseHandler = useRef<MouseHandler | null>(null);
    if (!mouseHandler.current) {
        mouseHandler.current = new MouseHandler(
            onAddNote,
            onDeleteNote,
            setSelectedNote,
            previewNote,
            pressNote,
            releaseNote,
            getNotes,
            gridParams,
            playbackEnabled,
            saveState
        );
    }
    useEffect(() => {
        if (mouseHandler.current) mouseHandler.current.gridParams = gridParams;
    }, [gridParams]);

    useEffect(() => {
        if (mouseHandler.current)
            mouseHandler.current.playbackEnabled = playbackEnabled;
    }, [playbackEnabled]);

    return mouseHandler.current;
}
