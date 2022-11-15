import * as Tone from "tone";
import { DEFAULT_NOTE_LENGTH } from "../../constants";
import RollCoordinates from "../../interfaces/RollCoordinates";
import { Note, Sequencer } from "../../sequencer";
import { MouseHandler } from "./mouseHandler";

export abstract class State {
    mouseHandler: MouseHandler;

    constructor(mouseHandler: MouseHandler) {
        this.mouseHandler = mouseHandler;
    }

    public abstract handleLeftClick(
        coords: RollCoordinates,
        currentNotes: Note[]
    ): void;
    public abstract handleRightClick(
        coords: RollCoordinates,
        currentNotes: Note[]
    ): void;
    public abstract handleLeftRelease(
        coords: RollCoordinates,
        currentNotes: Note[]
    ): void;
    public abstract handleRightRelease(
        coords: RollCoordinates,
        currentNotes: Note[]
    ): void;
    public abstract handleMouseMove(
        coords: RollCoordinates,
        currentNotes: Note[]
    ): void;
}

export class ReadyState extends State {
    public handleLeftClick(coords: RollCoordinates, currentNotes: Note[]) {
        const n = this.mouseHandler.getNotesAt(coords, currentNotes);
        if (n.length > 0) {
            this.mouseHandler.selectNote(n[n.length - 1]);
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
        }
        this.mouseHandler.changeState(new MovingState(this.mouseHandler));
    }

    public handleRightClick(coords: RollCoordinates, notes: Note[]) {
        const n = this.mouseHandler.getNotesAt(coords, notes);
        if (n.length > 0) this.mouseHandler.deleteNote(n[n.length - 1]);
        this.mouseHandler.changeState(new DeletingState(this.mouseHandler));
    }

    public handleLeftRelease(coords: RollCoordinates) {}
    public handleRightRelease(coords: RollCoordinates) {}
    public handleMouseMove(coords: RollCoordinates) {}
}

export class MovingState extends State {
    public handleLeftClick() {}
    public handleRightClick() {}
    public handleLeftRelease() {
        this.mouseHandler.changeState(new ReadyState(this.mouseHandler));
    }

    public handleRightRelease(coords: RollCoordinates) {}

    public handleMouseMove(coords: RollCoordinates) {
        const oldNote = this.mouseHandler.selectedNote;
        if (oldNote === null) {
            throw new Error("Note is not selected");
        }
        const newNote = {
            time: Sequencer.rollTimeToToneTime(coords.column),
            pitch: Tone.Frequency(this.mouseHandler.gridParams.lowestNote)
                .transpose(this.mouseHandler.gridParams.height - coords.row - 1)
                .toNote(),
            length: oldNote.length,
        };
        this.mouseHandler.addNote(newNote);
        this.mouseHandler.selectNote(newNote);
        this.mouseHandler.deleteNote(oldNote);
    }
}

class DeletingState extends State {
    public handleLeftClick() {}
    public handleRightClick() {}
    public handleLeftRelease() {}

    public handleRightRelease(coords: RollCoordinates, currentNotes: Note[]) {
        this.mouseHandler.changeState(new ReadyState(this.mouseHandler));
    }

    public handleMouseMove(coords: RollCoordinates, currentNotes: Note[]) {
        const n = this.mouseHandler.getNotesAt(coords, currentNotes);
        if (n.length > 0) this.mouseHandler.deleteNote(n[n.length - 1]);
    }
}
