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
    BG_COLOR,
    LIGHT_BG_COLOR,
    PIANO_ROLL_BG_COLOR,
    PIANO_ROLL_BLACK_KEY_COLOR,
    PIANO_ROLL_GRID_COLORS,
    PIANO_ROLL_HEADER_SIZE,
    PIANO_ROLL_NOTE_HEIGHT,
    PIANO_ROLL_NOTE_WIDTH,
    PIANO_ROLL_PLAYHEAD_COLOR,
    PRIMARY_COLOR,
    SECONDARY_COLOR,
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
    const [currentDrawState, setCurrentDrawState] = useState<DrawState>(
        DrawState.NOTHING
    );

    const isBlackKey = useCallback(
        (row: number) => {
            return Tone.Frequency(gridParams.lowestNote)
                .transpose(gridParams.height - row - 1)
                .toNote()
                .includes("#");
        },
        [gridParams]
    );

    const drawVLines = useCallback(
        (
            ctx: CanvasRenderingContext2D,
            color: string,
            width: number,
            skip: number
        ) => {
            ctx.beginPath();
            for (let i = skip; i < gridParams.width; i += skip) {
                ctx.moveTo(i * PIANO_ROLL_NOTE_WIDTH, PIANO_ROLL_HEADER_SIZE);
                ctx.lineTo(i * PIANO_ROLL_NOTE_WIDTH, ctx.canvas.height);
            }
            ctx.lineWidth = width;
            ctx.strokeStyle = color;
            ctx.closePath();
            ctx.stroke();
        },
        [gridParams]
    );

    const drawHLines = useCallback(
        (
            ctx: CanvasRenderingContext2D,
            color: string,
            width: number,
            skip: number
        ) => {
            ctx.beginPath();
            for (let i = skip; i < gridParams.height; i += skip) {
                ctx.moveTo(
                    0,
                    i * PIANO_ROLL_NOTE_HEIGHT + PIANO_ROLL_HEADER_SIZE
                );
                ctx.lineTo(
                    ctx.canvas.width,
                    i * PIANO_ROLL_NOTE_HEIGHT + PIANO_ROLL_HEADER_SIZE
                );
            }
            ctx.lineWidth = width;
            ctx.strokeStyle = color;
            ctx.closePath();
            ctx.stroke();
        },
        [gridParams]
    );

    const drawGrid = useCallback(
        (ctx: CanvasRenderingContext2D) => {
            ctx.fillStyle = PIANO_ROLL_BG_COLOR;
            ctx.rect(
                0,
                PIANO_ROLL_HEADER_SIZE,
                ctx.canvas.width,
                ctx.canvas.height - PIANO_ROLL_HEADER_SIZE
            );
            ctx.fill();
            ctx.fillStyle = PIANO_ROLL_BLACK_KEY_COLOR;
            for (let i = 0; i < gridParams.height; i += 1) {
                if (isBlackKey(i)) {
                    ctx.fillRect(
                        0,
                        i * PIANO_ROLL_NOTE_HEIGHT + PIANO_ROLL_HEADER_SIZE,
                        ctx.canvas.width,
                        PIANO_ROLL_NOTE_HEIGHT
                    );
                }
            }
            drawVLines(ctx, PIANO_ROLL_GRID_COLORS[0], 1, 1);
            drawVLines(ctx, PIANO_ROLL_GRID_COLORS[1], 3, 8);
            drawVLines(ctx, PIANO_ROLL_GRID_COLORS[2], 3, 16);
            drawHLines(ctx, PIANO_ROLL_GRID_COLORS[0], 1, 1);
            drawHLines(ctx, PIANO_ROLL_GRID_COLORS[0], 3, 12);
        },
        [gridParams, isBlackKey, drawVLines, drawHLines]
    );

    const drawHeader = useCallback((ctx: CanvasRenderingContext2D) => {
        requestAnimationFrame(() => {
            ctx.fillStyle = BG_COLOR;
            ctx.fillRect(0, 0, ctx.canvas.width, PIANO_ROLL_HEADER_SIZE);
            let grd = ctx.createLinearGradient(
                0,
                0,
                Tone.Transport.progress * ctx.canvas.width,
                0
            );
            grd.addColorStop(0, PIANO_ROLL_BG_COLOR);
            grd.addColorStop(0.5, PIANO_ROLL_PLAYHEAD_COLOR);
            ctx.fillStyle = grd;
            ctx.fillRect(
                0,
                0,
                Tone.Transport.progress * ctx.canvas.width,
                PIANO_ROLL_HEADER_SIZE
            );
        });
    }, []);

    const drawNotes = useCallback(
        (ctx: CanvasRenderingContext2D) => {
            ctx.strokeStyle = SECONDARY_COLOR;

            notes.forEach((n) => {
                const x =
                    Sequencer.toneTimeToRollTime(n.time) *
                    PIANO_ROLL_NOTE_WIDTH;
                const y =
                    Sequencer.tonePitchToRollPitch(
                        n.pitch,
                        gridParams.lowestNote,
                        gridParams.height
                    ) *
                        PIANO_ROLL_NOTE_HEIGHT +
                    PIANO_ROLL_HEADER_SIZE;
                const w =
                    Sequencer.toneTimeToRollTime(n.length) *
                    PIANO_ROLL_NOTE_WIDTH;
                const h = PIANO_ROLL_NOTE_HEIGHT;

                const grd = ctx.createLinearGradient(x - 30, y, x + w, y);
                grd.addColorStop(0, LIGHT_BG_COLOR);
                grd.addColorStop(0.7, PRIMARY_COLOR);

                ctx.fillStyle = grd;
                ctx.fillRect(x, y, w, h);
                ctx.strokeRect(x, y, w, h);
            });
        },
        [gridParams, notes]
    );

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.height =
                PIANO_ROLL_HEADER_SIZE +
                gridParams.height * PIANO_ROLL_NOTE_HEIGHT;
            canvas.width = gridParams.width * PIANO_ROLL_NOTE_WIDTH;
            canvas.style.width = canvas.width + "px";
            canvas.style.height = canvas.height + "px";
            const context = canvas.getContext("2d");
            if (context) {
                drawGrid(context);
                drawNotes(context);
            }
        }
    }, [drawGrid, drawNotes, gridParams]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const context = canvas.getContext("2d");
            if (context) {
                drawHeader(context);
                Sequencer.runCallbackOnBeat(() => {
                    drawHeader(context);
                });
            }
        }
    }, [drawHeader]);

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const { offsetX, offsetY } = e.nativeEvent;
        const [ri, ci] = getCoordsAtOffset(offsetX, offsetY);
        if (ri >= 0) {
            if (e.button === 0) {
                onAddNote(ri, ci);
                setCurrentDrawState(DrawState.DRAWING);
            } else if (e.button === 2) {
                onDeleteNote(ri, ci);
                setCurrentDrawState(DrawState.DELETING);
            }
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
            Math.floor(
                (offsetY - PIANO_ROLL_HEADER_SIZE) / PIANO_ROLL_NOTE_HEIGHT
            ),
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
