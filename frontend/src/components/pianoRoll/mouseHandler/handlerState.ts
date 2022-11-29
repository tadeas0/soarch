// eslint-disable-next-line import/no-cycle
import { MouseHandler } from "./mouseHandler";
import { MouseCoords } from "../../../interfaces/MouseCoords";

export default abstract class State {
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

    public abstract handleLeftClick(coords: MouseCoords): void;
    public abstract handleRightClick(coords: MouseCoords): void;
    public abstract handleLeftRelease(coords: MouseCoords): void;
    public abstract handleRightRelease(coords: MouseCoords): void;
    public abstract handleMouseMove(coords: MouseCoords): void;
}
