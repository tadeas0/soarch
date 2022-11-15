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

    public isNoteHandle(coords: RollCoordinates, notes: Note[]) {
        const noteEnds = notes.map((n) => [
            Sequencer.tonePitchToRollPitch(
                n.pitch,
                this.gridParams.lowestNote,
                this.gridParams.height
            ),
            Sequencer.toneTimeToRollTime(n.time) +
                Sequencer.toneTimeToRollTime(n.length) -
                1,
        ]);
        return (
            noteEnds.findIndex(
                (n) => n[0] === coords.row && n[1] === coords.column
            ) !== -1
        );
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
