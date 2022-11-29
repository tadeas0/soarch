/* eslint-disable import/no-cycle */
import { MouseCoords } from "../../../interfaces/MouseCoords";
import ReadyState from "./readyState";
import State from "./handlerState";

export default class DeletingState extends State {
    public handleLeftClick() {}

    public handleRightClick() {}

    public handleLeftRelease() {}

    public handleRightRelease() {
        this.mouseHandler.changeState(new ReadyState(this.mouseHandler));
    }

    public handleMouseMove(coords: MouseCoords) {
        const n = this.mouseHandler.getNotesAt(coords);
        if (n.length > 0) this.mouseHandler.deleteNote(n[n.length - 1]);
    }
}
