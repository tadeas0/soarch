import { useEffect, useRef } from "react";
import * as Tone from "tone";
import {
    PIANO_ROLL_HANDLE_PART,
    PIANO_ROLL_NOTE_HEIGHT,
    PIANO_ROLL_NOTE_WIDTH,
} from "../../constants";
import GridParams from "../../interfaces/GridParams";
import RollCoordinates from "../../interfaces/RollCoordinates";
import { Note, Sequencer } from "../../sound/sequencer";
import { ReadyState, State } from "./handlerState";

export interface MouseCoords {
    offsetX: number;
    offsetY: number;
}

export class MouseHandler {
    private state: State;
    private _gridParams: GridParams;
    private _selectedNote: Note | null;
    private onAddNote: (note: Note) => void;
    private onDeleteNote: (note: Note) => void;
    private changeSelectedNote: (note: Note) => void;
    private getNotes: () => Note[];
    private _playbackEnabled: boolean;

    constructor(
        onAddNote: (note: Note) => void,
        onDeleteNote: (note: Note) => void,
        changeSelectedNote: (note: Note) => void,
        getNotes: () => Note[],
        gridParams: GridParams,
        playbackEnabled: boolean
    ) {
        this.state = new ReadyState(this);
        this.onAddNote = onAddNote;
        this.onDeleteNote = onDeleteNote;
        this._gridParams = gridParams;
        this.changeSelectedNote = changeSelectedNote;
        this.getNotes = getNotes;
        this._playbackEnabled = playbackEnabled;
        this._selectedNote = null;
    }

    public getRollCoordsFromMouseCoords(coords: MouseCoords): RollCoordinates {
        const { offsetX, offsetY } = coords;
        return {
            row: Math.floor(offsetY / PIANO_ROLL_NOTE_HEIGHT),
            column: Math.floor(offsetX / PIANO_ROLL_NOTE_WIDTH),
        };
    }

    public set gridParams(value: GridParams) {
        this._gridParams = value;
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
            const s = Sequencer.getStartCoords(n, this._gridParams);
            const e = Sequencer.getEndCoords(n, this._gridParams);
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
        const endCoords = Sequencer.getEndCoords(topNote, this._gridParams);
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

    public addNote(note: Note) {
        this.onAddNote(note);
    }

    public deleteNote(note: Note) {
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

    public pressNote(note: Tone.Unit.Note) {
        if (this.playbackEnabled) Sequencer.pressNote(note);
    }

    public releaseNote(note: Tone.Unit.Note) {
        Sequencer.releaseNote(note);
    }
}

export function useMouseHandler(
    onAddNote: (note: Note) => void,
    onDeleteNote: (note: Note) => void,
    setSelectedNote: (note: Note) => void,
    getNotes: () => Note[],
    gridParams: GridParams,
    playbackEnabled: boolean
) {
    const mouseHandler = useRef<MouseHandler | null>(null);
    if (!mouseHandler.current) {
        mouseHandler.current = new MouseHandler(
            onAddNote,
            onDeleteNote,
            setSelectedNote,
            getNotes,
            gridParams,
            playbackEnabled
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
