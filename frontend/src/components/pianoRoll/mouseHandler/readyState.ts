/* eslint-disable import/no-cycle */
import * as Tone from "tone";
import { DEFAULT_NOTE_LENGTH } from "../../../constants";
import { Note } from "../../../interfaces/Note";
import { MouseCoords } from "../../../interfaces/MouseCoords";
import State from "./handlerState";
import ChangingLengthState from "./changingLengthState";
import DeletingState from "./deletingState";
import MovingState from "./movingState";
import { MouseHandler } from "./mouseHandler";
import { rollTimeToToneTime } from "../../../common/coordConversion";

export default class ReadyState extends State {
    private lastNotePlaying: Note | null;

    constructor(mouseHandler: MouseHandler, coords?: MouseCoords) {
        super(mouseHandler);
        if (coords) {
            const n = this.mouseHandler.getNotesAt(coords);
            this.lastNotePlaying = n[n.length - 1];
        } else {
            this.lastNotePlaying = null;
        }
    }

    public handleLeftClick(coords: MouseCoords) {
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
            this.mouseHandler.previewNote(selected);
            this.mouseHandler.changeState(
                new MovingState(this.mouseHandler, coords)
            );
        } else {
            this.mouseHandler.saveState();
            const rollCoords =
                this.mouseHandler.getRollCoordsFromMouseCoords(coords);
            const len = Math.min(
                DEFAULT_NOTE_LENGTH,
                this.mouseHandler.gridParams.width - rollCoords.column
            );
            const newNote: Note = {
                time: rollTimeToToneTime(rollCoords.column),
                pitch: Tone.Frequency(
                    this.mouseHandler.gridParams.lowestNote
                ).transpose(
                    this.mouseHandler.gridParams.height - rollCoords.row - 1
                ),
                length: rollTimeToToneTime(len),
            };
            this.mouseHandler.addNote(newNote);
            this.mouseHandler.selectNote(newNote);
            this.mouseHandler.previewNote(newNote);
            this.setMoveCursor();
            this.mouseHandler.changeState(
                new MovingState(this.mouseHandler, coords)
            );
        }
    }

    public handleRightClick(coords: MouseCoords) {
        const n = this.mouseHandler.getNotesAt(coords);
        if (n.length > 0) {
            this.mouseHandler.saveState();
            this.mouseHandler.deleteNote(n[n.length - 1]);
        }
        this.mouseHandler.changeState(new DeletingState(this.mouseHandler));
    }

    public handleLeftRelease() {}

    public handleRightRelease() {}

    public handleMouseMove(coords: MouseCoords) {
        const noteHandle = this.mouseHandler.noteHandle(coords);
        const n = this.mouseHandler.getNotesAt(coords);
        if (noteHandle !== null) {
            const newNote = noteHandle;
            if (
                newNote !== this.lastNotePlaying &&
                this.mouseHandler.playbackEnabled
            ) {
                this.lastNotePlaying = newNote;
                this.mouseHandler.previewNote(newNote);
            }
            this.setResizeCursor();
        } else if (n.length > 0) {
            const newNote = n[n.length - 1];
            if (
                newNote !== this.lastNotePlaying &&
                this.mouseHandler.playbackEnabled
            ) {
                this.lastNotePlaying = newNote;
                this.mouseHandler.previewNote(newNote);
            }
            this.setMoveCursor();
        } else {
            this.lastNotePlaying = null;
            this.setDefaultCursor();
        }
    }
}
