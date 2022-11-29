/* eslint-disable import/no-cycle */
import * as Tone from "tone";
import { Sequencer } from "../../../sound/sequencer";
import { MouseHandler } from "./mouseHandler";
import { MouseCoords } from "../../../interfaces/MouseCoords";
import ReadyState from "./readyState";
import State from "./handlerState";

export default class MovingState extends State {
    private columnOffset: number;

    constructor(mouseHandler: MouseHandler, mouseCoords: MouseCoords) {
        super(mouseHandler);
        if (this.mouseHandler.selectedNote === null)
            throw new Error("Note is not selected");
        const sel = Sequencer.getStartCoords(
            this.mouseHandler.selectedNote,
            this.mouseHandler.gridParams
        );
        const rollCoords =
            this.mouseHandler.getRollCoordsFromMouseCoords(mouseCoords);
        this.columnOffset = rollCoords.column - sel.column;
    }

    public handleLeftClick() {}

    public handleRightClick() {}

    public handleLeftRelease() {
        const selectedNote = this.mouseHandler.selectedNote;
        if (selectedNote === null) {
            throw new Error("Note is not selected");
        }
        this.mouseHandler.releaseNote(selectedNote.pitch);

        this.mouseHandler.changeState(new ReadyState(this.mouseHandler));
    }

    public handleRightRelease() {}

    public handleMouseMove(coords: MouseCoords) {
        const oldNote = this.mouseHandler.selectedNote;
        if (oldNote === null) {
            throw new Error("Note is not selected");
        }
        const rollCoords =
            this.mouseHandler.getRollCoordsFromMouseCoords(coords);
        const newColumn = Math.min(
            this.mouseHandler.gridParams.width -
                Sequencer.toneTimeToRollTime(oldNote.length),
            Math.max(0, rollCoords.column - this.columnOffset)
        );
        const newNote = {
            time: Sequencer.rollTimeToToneTime(newColumn),
            pitch: Tone.Frequency(this.mouseHandler.gridParams.lowestNote)
                .transpose(
                    this.mouseHandler.gridParams.height - rollCoords.row - 1
                )
                .toNote(),
            length: oldNote.length,
        };
        if (oldNote.pitch !== newNote.pitch) {
            this.mouseHandler.releaseNote(oldNote.pitch);
            this.mouseHandler.pressNote(newNote.pitch);
        }
        this.mouseHandler.addNote(newNote);
        this.mouseHandler.selectNote(newNote);
        this.mouseHandler.deleteNote(oldNote);
    }
}
