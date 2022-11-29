/* eslint-disable import/no-cycle */
import { Note, Sequencer } from "../../../sound/sequencer";
import { MouseCoords } from "../../../interfaces/MouseCoords";
import ReadyState from "./readyState";
import State from "./handlerState";

export default class ChangingLengthState extends State {
    public handleLeftClick() {}

    public handleRightClick() {}

    public handleRightRelease() {}

    public handleLeftRelease() {
        this.mouseHandler.changeState(new ReadyState(this.mouseHandler));
    }

    public handleMouseMove(coords: MouseCoords) {
        const oldNote = this.mouseHandler.selectedNote;
        if (oldNote === null) {
            throw new Error("Note is not selected");
        }

        const start = Sequencer.toneTimeToRollTime(oldNote.time);
        const rollCoords =
            this.mouseHandler.getRollCoordsFromMouseCoords(coords);
        const newLen = Math.max(1, rollCoords.column - start + 1);
        const newNote: Note = {
            length: Sequencer.rollTimeToToneTime(newLen),
            pitch: oldNote.pitch,
            time: oldNote.time,
        };
        this.mouseHandler.addNote(newNote);
        this.mouseHandler.selectNote(newNote);
        this.mouseHandler.deleteNote(oldNote);
    }
}
