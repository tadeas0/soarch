/* eslint-disable import/no-cycle */
import { Note } from "../../../interfaces/Note";
import { MouseCoords } from "../../../interfaces/MouseCoords";
import ReadyState from "./readyState";
import State from "./handlerState";
import { MouseHandler } from "./mouseHandler";
import {
    rollTimeToToneTime,
    toneTimeToRollTime,
} from "../../../common/coordConversion";

export default class ChangingLengthState extends State {
    private alreadySaved: boolean;

    constructor(mouseHandler: MouseHandler) {
        super(mouseHandler);
        this.alreadySaved = false;
    }

    public handleLeftClick() {}

    public handleRightClick() {}

    public handleRightRelease() {}

    public handleLeftRelease(coords: MouseCoords) {
        this.mouseHandler.changeState(
            new ReadyState(this.mouseHandler, coords)
        );
    }

    public handleMouseMove(coords: MouseCoords) {
        if (!this.alreadySaved) {
            this.mouseHandler.saveState();
            this.alreadySaved = true;
        }
        const oldNote = this.mouseHandler.selectedNote;
        if (oldNote === null) {
            throw new Error("Note is not selected");
        }

        const start = toneTimeToRollTime(oldNote.time);
        const rollCoords =
            this.mouseHandler.getRollCoordsFromMouseCoords(coords);
        const newLen = Math.max(1, rollCoords.column - start + 1);
        const newNote: Note = {
            length: rollTimeToToneTime(newLen),
            pitch: oldNote.pitch,
            time: oldNote.time,
        };
        this.mouseHandler.addNote(newNote);
        this.mouseHandler.selectNote(newNote);
        this.mouseHandler.deleteNote(oldNote);
    }
}
