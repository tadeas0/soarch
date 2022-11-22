import { useEffect, useRef } from "react";
import * as Tone from "tone";
import GridParams from "../../interfaces/GridParams";
import RollCoordinates from "../../interfaces/RollCoordinates";
import { Note, Sequencer } from "../../sound/sequencer";
import { ReadyState, State } from "./handlerState";

export class MouseHandler {
    private state: State;
    private _gridParams: GridParams;
    private _selectedNote: Note | null;
    private onAddNote: (note: Note) => void;
    private onDeleteNote: (note: Note) => void;
    private changeSelectedNote: (note: Note) => void;
    private _playbackEnabled: boolean;

    constructor(
        onAddNote: (note: Note) => void,
        onDeleteNote: (note: Note) => void,
        changeSelectedNote: (note: Note) => void,
        gridParams: GridParams,
        playbackEnabled: boolean
    ) {
        this.state = new ReadyState(this);
        this.onAddNote = onAddNote;
        this.onDeleteNote = onDeleteNote;
        this._gridParams = gridParams;
        this.changeSelectedNote = changeSelectedNote;
        this._playbackEnabled = playbackEnabled;
        this._selectedNote = null;
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

    public getNotesAt(coords: RollCoordinates, notes: Note[]): Note[] {
        return notes.filter((n) => {
            const s = Sequencer.getStartCoords(n, this._gridParams);
            const e = Sequencer.getEndCoords(n, this._gridParams);
            return (
                s.row === coords.row &&
                s.column <= coords.column &&
                e.column >= coords.column
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
    public noteHandle(coords: RollCoordinates, notes: Note[]): Note | null {
        const clickedNotes = this.getNotesAt(coords, notes);
        if (clickedNotes.length <= 0) {
            return null;
        }
        const topNote = clickedNotes[clickedNotes.length - 1];
        const endCoords = Sequencer.getEndCoords(topNote, this._gridParams);
        if (this.cmpCoords(coords, endCoords)) {
            return topNote;
        }
        return null;
    }

    private cmpCoords(
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

    public onLeftClick(coords: RollCoordinates, currentNotes: Note[]) {
        this.state.handleLeftClick(coords, currentNotes);
    }

    public onRightClick(coords: RollCoordinates, currentNotes: Note[]) {
        this.state.handleRightClick(coords, currentNotes);
    }

    public onMouseMove(coords: RollCoordinates, currentNotes: Note[]) {
        this.state.handleMouseMove(coords, currentNotes);
    }

    public onLeftRelease(coords: RollCoordinates, currentNotes: Note[]) {
        this.state.handleLeftRelease(coords, currentNotes);
    }

    public onRightRelease(coords: RollCoordinates, currentNotes: Note[]) {
        this.state.handleRightRelease(coords, currentNotes);
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
    gridParams: GridParams,
    playbackEnabled: boolean
) {
    const mouseHandler = useRef<MouseHandler | null>(null);
    if (!mouseHandler.current) {
        mouseHandler.current = new MouseHandler(
            onAddNote,
            onDeleteNote,
            setSelectedNote,
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
