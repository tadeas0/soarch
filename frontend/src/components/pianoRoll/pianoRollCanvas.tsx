import { FunctionComponent, useCallback, useEffect, useRef } from "react";
import * as Tone from "tone";
import {
    PIANO_ROLL_NOTE_WIDTH,
    PIANO_ROLL_HEADER_SIZE,
    PIANO_ROLL_NOTE_HEIGHT,
    PIANO_ROLL_BG_COLOR,
    PIANO_ROLL_BLACK_KEY_COLOR,
    PIANO_ROLL_GRID_COLORS,
    BG_COLOR,
    PIANO_ROLL_PLAYHEAD_COLOR,
    SECONDARY_COLOR,
    LIGHT_BG_COLOR,
    PRIMARY_COLOR,
} from "../../constants";
import { Note, Sequencer } from "../../sequencer";
import { GridParams } from "./pianoRollGrid";

interface PianoRollCanvasProps {
    onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    onMouseUp: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    gridParams: GridParams;
    notes: Note[];
}

const PianoRollCanvas: FunctionComponent<PianoRollCanvasProps> = (props) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const isBlackKey = useCallback(
        (row: number) => {
            return Tone.Frequency(props.gridParams.lowestNote)
                .transpose(props.gridParams.height - row - 1)
                .toNote()
                .includes("#");
        },
        [props.gridParams]
    );

    const drawVLines = useCallback(
        (
            ctx: CanvasRenderingContext2D,
            color: string,
            width: number,
            skip: number
        ) => {
            ctx.beginPath();
            for (let i = skip; i < props.gridParams.width; i += skip) {
                ctx.moveTo(i * PIANO_ROLL_NOTE_WIDTH, PIANO_ROLL_HEADER_SIZE);
                ctx.lineTo(i * PIANO_ROLL_NOTE_WIDTH, ctx.canvas.height);
            }
            ctx.lineWidth = width;
            ctx.strokeStyle = color;
            ctx.closePath();
            ctx.stroke();
        },
        [props.gridParams]
    );

    const drawHLines = useCallback(
        (
            ctx: CanvasRenderingContext2D,
            color: string,
            width: number,
            skip: number
        ) => {
            ctx.beginPath();
            for (let i = skip; i < props.gridParams.height; i += skip) {
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
        [props.gridParams]
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
            for (let i = 0; i < props.gridParams.height; i += 1) {
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
        [props.gridParams, isBlackKey, drawVLines, drawHLines]
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

            props.notes.forEach((n) => {
                const x =
                    Sequencer.toneTimeToRollTime(n.time) *
                    PIANO_ROLL_NOTE_WIDTH;
                const y =
                    Sequencer.tonePitchToRollPitch(
                        n.pitch,
                        props.gridParams.lowestNote,
                        props.gridParams.height
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
        [props.gridParams, props.notes]
    );

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.height =
                PIANO_ROLL_HEADER_SIZE +
                props.gridParams.height * PIANO_ROLL_NOTE_HEIGHT;
            canvas.width = props.gridParams.width * PIANO_ROLL_NOTE_WIDTH;
            canvas.style.width = canvas.width + "px";
            canvas.style.height = canvas.height + "px";
            const context = canvas.getContext("2d");
            if (context) {
                drawGrid(context);
                drawNotes(context);
            }
        }
    }, [drawGrid, drawNotes, props.gridParams]);

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

    return (
        <canvas
            ref={canvasRef}
            onMouseDown={props.onMouseDown}
            onMouseMove={props.onMouseMove}
            onMouseUp={props.onMouseUp}
            onContextMenu={(e) => e.preventDefault()}
        />
    );
};

export default PianoRollCanvas;
