/* eslint-disable import/no-cycle */
import { Note } from "../../../interfaces/Note";
import { MouseHandler } from "./mouseHandler";
import { MouseCoords } from "../../../interfaces/MouseCoords";
import ReadyState from "./readyState";
import State from "./handlerState";
import {
    getStartRollCoords,
    rollCoordsToTone,
} from "../../../common/coordConversion";
import RollCoordinates from "../../../interfaces/RollCoordinates";
import { clamp } from "../../../common/common";

export default class MovingState extends State {
    private columnOffset: number;

    private alreadySaved: boolean;

    constructor(mouseHandler: MouseHandler, mouseCoords: MouseCoords) {
        super(mouseHandler);
        if (this.mouseHandler.selectedNote === null)
            throw new Error("Note is not selected");
        const sel = getStartRollCoords(
            this.mouseHandler.selectedNote,
            this.mouseHandler.gridParams
        );
        const rollCoords =
            this.mouseHandler.getRollCoordsFromMouseCoords(mouseCoords);
        this.alreadySaved = false;
        this.columnOffset = rollCoords.column - sel.column;
    }

    public handleLeftClick() {}

    public handleRightClick() {}

    public handleLeftRelease(mouseCoords: MouseCoords) {
        const selectedNote = this.mouseHandler.selectedNote;
        if (selectedNote === null) {
            throw new Error("Note is not selected");
        }

        this.mouseHandler.changeState(
            new ReadyState(this.mouseHandler, mouseCoords)
        );
    }

    public handleRightRelease() {}

    public handleMouseMove(coords: MouseCoords) {
        if (!this.alreadySaved) {
            this.mouseHandler.saveState();
            this.alreadySaved = true;
        }
        const oldNote = this.mouseHandler.selectedNote;
        if (oldNote === null) {
            throw new Error("Note is not selected");
        }
        const { row, column } =
            this.mouseHandler.getRollCoordsFromMouseCoords(coords);
        const { height, width } = this.mouseHandler.gridParams;
        const newColumn = clamp(column - this.columnOffset, 0, width);
        const newRow = clamp(row, 0, height);
        const newCoords: RollCoordinates = { row: newRow, column: newColumn };
        const noteCoords = rollCoordsToTone(
            newCoords,
            this.mouseHandler.gridParams
        );
        const newNote: Note = { ...noteCoords, length: oldNote.length };
        if (oldNote.pitch.toNote() !== newNote.pitch.toNote()) {
            this.mouseHandler.previewNote(newNote);
        }
        this.mouseHandler.addNote(newNote);
        this.mouseHandler.selectNote(newNote);
        this.mouseHandler.deleteNote(oldNote);
    }
}
