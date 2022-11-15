import { useRef } from "react";
import GridParams from "../../interfaces/GridParams";
import RollCoordinates from "../../interfaces/RollCoordinates";
import { Note, Sequencer } from "../../sequencer";
import { ReadyState, State } from "./handlerState";

export class MouseHandler {
    private state: State;
    private _gridParams: GridParams;
    private _selectedNote: Note | null;
    private onAddNote: (note: Note) => void;
    private onDeleteNote: (note: Note) => void;
    private changeSelectedNote: (note: Note) => void;

    constructor(
        onAddNote: (note: Note) => void,
        onDeleteNote: (note: Note) => void,
        changeSelectedNote: (note: Note) => void,
        gridParams: GridParams
    ) {
        this.state = new ReadyState(this);
        this.onAddNote = onAddNote;
        this.onDeleteNote = onDeleteNote;
        this._gridParams = gridParams;
        this.changeSelectedNote = changeSelectedNote;
        this._selectedNote = null;
    }

    public getNotesAt(coords: RollCoordinates, notes: Note[]): Note[] {
        return notes.filter((n) => {
            const s = Sequencer.toneTimeToRollTime(n.time);
            const e = s + Sequencer.toneTimeToRollTime(n.length);
            const p = Sequencer.tonePitchToRollPitch(
                n.pitch,
                this._gridParams.lowestNote,
                this._gridParams.height
            );
            return p === coords.row && s <= coords.column && e > coords.column;
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
        const pitch = Sequencer.tonePitchToRollPitch(
            topNote.pitch,
            this.gridParams.lowestNote,
            this.gridParams.height
        );
        const endTime =
            Sequencer.toneTimeToRollTime(topNote.time) +
            Sequencer.toneTimeToRollTime(topNote.length) -
            1;
        if (pitch === coords.row && endTime === coords.column) {
            return topNote;
        }
        return null;
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
}

export function useMouseHandler(
    onAddNote: (note: Note) => void,
    onDeleteNote: (note: Note) => void,
    setSelectedNote: (note: Note) => void,
    gridParams: GridParams
) {
    const mouseHandler = useRef<MouseHandler | null>(null);
    if (!mouseHandler.current) {
        mouseHandler.current = new MouseHandler(
            onAddNote,
            onDeleteNote,
            setSelectedNote,
            gridParams
        );
    }
    return mouseHandler.current;
}
