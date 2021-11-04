import * as React from "react";
import {
    FunctionComponent,
    useState,
    useEffect,
    useRef,
    useCallback,
} from "react";
import "./pianoRoll.css";
import * as Tone from "tone";
import {
    PIANO_ROLL_LOWEST_NOTE,
    PIANO_ROLL_NOTE_HEIGHT,
    PIANO_ROLL_NOTE_WIDTH,
} from "../constants";
import { Sequencer, Note } from "../sequencer";

export interface GridParams {
    width: number;
    height: number;
    lowestNote: Tone.Unit.Note;
}

interface PianoRollGridProps {
    notes: Note[];
    gridParams: GridParams;
    onDeleteNote?: (ri: number, ci: number) => void;
    onAddNote?: (ri: number, ci: number) => void;
}

enum DrawState {
    DRAWING,
    DELETING,
    NOTHING,
}

// TODO: cleanup event handling
const PianoRollGrid: FunctionComponent<PianoRollGridProps> = ({
    notes,
    gridParams,
    onAddNote = (ri: number, ci: number) => {},
    onDeleteNote = (ri: number, ci: number) => {},
}: PianoRollGridProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const [currentDrawState, setCurrentDrawState] = useState<DrawState>(
        DrawState.NOTHING
    );

    const drawGrid = (ctx: CanvasRenderingContext2D) => {
        const lineColors = ["black", "black", "blue"];
        const fillColor = "gray";
        ctx.fillStyle = fillColor;
        for (let i = 0; i < gridParams.height; i += 1) {
            if (isBlackKey(i)) {
                ctx.fillRect(
                    0,
                    i * PIANO_ROLL_NOTE_HEIGHT,
                    ctx.canvas.width,
                    PIANO_ROLL_NOTE_HEIGHT
                );
            }
        }
        // Basic grid
        ctx.moveTo(0, 0);
        ctx.beginPath();
        for (let i = 0; i <= gridParams.width; i++) {
            ctx.moveTo(i * PIANO_ROLL_NOTE_WIDTH, 0);
            ctx.lineTo(i * PIANO_ROLL_NOTE_WIDTH, ctx.canvas.height);
        }
        for (let i = 0; i <= gridParams.height; i++) {
            ctx.moveTo(0, i * PIANO_ROLL_NOTE_HEIGHT);
            ctx.lineTo(ctx.canvas.width, i * PIANO_ROLL_NOTE_HEIGHT);
        }
        ctx.strokeStyle = lineColors[0];
        ctx.closePath();
        ctx.stroke();

        // Thick lines
        ctx.beginPath();
        for (let i = 4; i < gridParams.width; i += 4) {
            ctx.moveTo(i * PIANO_ROLL_NOTE_WIDTH, 0);
            ctx.lineTo(i * PIANO_ROLL_NOTE_WIDTH, ctx.canvas.height);
        }
        ctx.lineWidth = 3;
        ctx.strokeStyle = lineColors[1];
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        for (let i = 8; i < gridParams.width; i += 8) {
            ctx.moveTo(i * PIANO_ROLL_NOTE_WIDTH, 0);
            ctx.lineTo(i * PIANO_ROLL_NOTE_WIDTH, ctx.canvas.height);
        }
        ctx.lineWidth = 3;
        ctx.strokeStyle = lineColors[2];
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        for (let i = 12; i < gridParams.height; i += 12) {
            ctx.moveTo(0, i * PIANO_ROLL_NOTE_WIDTH);
            ctx.lineTo(ctx.canvas.width, i * PIANO_ROLL_NOTE_WIDTH);
        }
        ctx.lineWidth = 3;
        ctx.strokeStyle = lineColors[0];
        ctx.closePath();
        ctx.stroke();
    };

    const drawNotes = (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = "red";
        notes.forEach((n) => {
            ctx.fillRect(
                Sequencer.toneTimeToRollTime(n.time) * PIANO_ROLL_NOTE_WIDTH,
                Sequencer.tonePitchToRollPitch(
                    n.pitch,
                    gridParams.lowestNote,
                    gridParams.height
                ) * PIANO_ROLL_NOTE_HEIGHT,
                Sequencer.toneTimeToRollTime(n.length) * PIANO_ROLL_NOTE_WIDTH,
                20
            );
        });
    };

    const draw = useCallback(
        (ctx: CanvasRenderingContext2D) => {
            drawGrid(ctx);
            drawNotes(ctx);
        },
        [gridParams, notes]
    );

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.height = gridParams.height * PIANO_ROLL_NOTE_HEIGHT;
            canvas.width = gridParams.width * PIANO_ROLL_NOTE_WIDTH;
            const context = canvas.getContext("2d");
            ctxRef.current = context;
            if (context) draw(context);
        }
    }, [draw, gridParams]);

    const isBlackKey = (row: number) => {
        return Tone.Frequency(PIANO_ROLL_LOWEST_NOTE)
            .transpose(gridParams.height - row - 1)
            .toNote()
            .includes("#");
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const { offsetX, offsetY } = e.nativeEvent;
        const [ri, ci] = getCoordsAtOffset(offsetX, offsetY);
        if (e.button === 0) {
            onAddNote(ri, ci);
            setCurrentDrawState(DrawState.DRAWING);
        } else if (e.button === 2) {
            onDeleteNote(ri, ci);
            setCurrentDrawState(DrawState.DELETING);
        }
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (e.button === 0 && currentDrawState === DrawState.DRAWING) {
            setCurrentDrawState(DrawState.NOTHING);
        } else if (e.button === 2 && currentDrawState === DrawState.DELETING) {
            setCurrentDrawState(DrawState.NOTHING);
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const { offsetX, offsetY } = e.nativeEvent;
        const [ri, ci] = getCoordsAtOffset(offsetX, offsetY);
        if (currentDrawState === DrawState.DELETING) {
            onDeleteNote(ri, ci);
        }
    };

    const getCoordsAtOffset = (offsetX: number, offsetY: number) => {
        return [
            Math.floor(offsetY / PIANO_ROLL_NOTE_HEIGHT),
            Math.floor(offsetX / PIANO_ROLL_NOTE_WIDTH),
        ];
    };

    return (
        <div className="table-container">
            <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onContextMenu={(e) => e.preventDefault()}
            />
        </div>
    );
};

export default PianoRollGrid;
