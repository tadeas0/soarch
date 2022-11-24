import * as Tone from "tone";
import { DEFAULT_NOTE_LENGTH } from "../../constants";
import RollCoordinates from "../../interfaces/RollCoordinates";
import { Note, Sequencer } from "../../sound/sequencer";
import { MouseHandler } from "./mouseHandler";

export abstract class State {
    mouseHandler: MouseHandler;

    constructor(mouseHandler: MouseHandler) {
        this.mouseHandler = mouseHandler;
    }

    protected setMoveCursor() {
        document.body.style.cursor = "move";
    }

    protected setDefaultCursor() {
        document.body.style.cursor = "default";
    }

    protected setResizeCursor() {
        document.body.style.cursor = "ew-resize";
    }

    public abstract handleLeftClick(coords: RollCoordinates): void;
    public abstract handleRightClick(coords: RollCoordinates): void;
    public abstract handleLeftRelease(coords: RollCoordinates): void;
    public abstract handleRightRelease(coords: RollCoordinates): void;
    public abstract handleMouseMove(coords: RollCoordinates): void;
}

export class ReadyState extends State {
    public handleLeftClick(coords: RollCoordinates) {
        const n = this.mouseHandler.getNotesAt(coords);
        const noteHandle = this.mouseHandler.noteHandle(coords);
        if (noteHandle !== null) {
            this.mouseHandler.selectNote(noteHandle);
            this.mouseHandler.changeState(
                new ChangingLengthState(this.mouseHandler)
            );
        } else if (n.length > 0) {
            const selected = n[n.length - 1];
            this.mouseHandler.selectNote(selected);
            this.mouseHandler.pressNote(selected.pitch);
            this.mouseHandler.changeState(
                new MovingState(this.mouseHandler, coords)
            );
        } else {
            const newNote = {
                time: Sequencer.rollTimeToToneTime(coords.column),
                pitch: Tone.Frequency(this.mouseHandler.gridParams.lowestNote)
                    .transpose(
                        this.mouseHandler.gridParams.height - coords.row - 1
                    )
                    .toNote(),
                length: Sequencer.rollTimeToToneTime(DEFAULT_NOTE_LENGTH),
            };
            this.mouseHandler.addNote(newNote);
            this.mouseHandler.selectNote(newNote);
            this.mouseHandler.pressNote(newNote.pitch);
            this.setMoveCursor();
            this.mouseHandler.changeState(
                new MovingState(this.mouseHandler, coords)
            );
        }
    }

    public handleRightClick(coords: RollCoordinates) {
        const n = this.mouseHandler.getNotesAt(coords);
        if (n.length > 0) this.mouseHandler.deleteNote(n[n.length - 1]);
        this.mouseHandler.changeState(new DeletingState(this.mouseHandler));
    }

    public handleLeftRelease(coords: RollCoordinates) {}
    public handleRightRelease(coords: RollCoordinates) {}
    public handleMouseMove(coords: RollCoordinates) {
        const noteHandle = this.mouseHandler.noteHandle(coords);
        const n = this.mouseHandler.getNotesAt(coords);
        if (noteHandle !== null) {
            this.setResizeCursor();
        } else if (n.length > 0) {
            this.setMoveCursor();
        } else {
            this.setDefaultCursor();
        }
    }
}

class MovingState extends State {
    private columnOffset: number;

    constructor(mouseHandler: MouseHandler, mouseCoords: RollCoordinates) {
        super(mouseHandler);
        if (this.mouseHandler.selectedNote === null)
            throw new Error("Note is not selected");
        const sel = Sequencer.getStartCoords(
            this.mouseHandler.selectedNote,
            this.mouseHandler.gridParams
        );
        this.columnOffset = mouseCoords.column - sel.column;
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

    public handleRightRelease(coords: RollCoordinates) {}

    public handleMouseMove(coords: RollCoordinates) {
        const oldNote = this.mouseHandler.selectedNote;
        if (oldNote === null) {
            throw new Error("Note is not selected");
        }
        const newColumn = Math.max(0, coords.column - this.columnOffset);
        const newNote = {
            time: Sequencer.rollTimeToToneTime(newColumn),
            pitch: Tone.Frequency(this.mouseHandler.gridParams.lowestNote)
                .transpose(this.mouseHandler.gridParams.height - coords.row - 1)
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

class DeletingState extends State {
    public handleLeftClick() {}
    public handleRightClick() {}
    public handleLeftRelease() {}

    public handleRightRelease(coords: RollCoordinates) {
        this.mouseHandler.changeState(new ReadyState(this.mouseHandler));
    }

    public handleMouseMove(coords: RollCoordinates) {
        const n = this.mouseHandler.getNotesAt(coords);
        if (n.length > 0) this.mouseHandler.deleteNote(n[n.length - 1]);
    }
}

class ChangingLengthState extends State {
    public handleLeftClick(coords: RollCoordinates) {}
    public handleRightClick(coords: RollCoordinates) {}
    public handleRightRelease(coords: RollCoordinates) {}

    public handleLeftRelease(coords: RollCoordinates) {
        this.mouseHandler.changeState(new ReadyState(this.mouseHandler));
    }

    public handleMouseMove(coords: RollCoordinates) {
        const oldNote = this.mouseHandler.selectedNote;
        if (oldNote === null) {
            throw new Error("Note is not selected");
        }

        const start = Sequencer.toneTimeToRollTime(oldNote.time);
        const newLen = Math.max(1, coords.column - start + 1);
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
