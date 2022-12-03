import {
    MouseEvent,
    FunctionComponent,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import * as Tone from "tone";
import {
    PIANO_ROLL_NOTE_WIDTH,
    PIANO_ROLL_NOTE_HEIGHT,
    PIANO_ROLL_BG_COLOR,
    PIANO_ROLL_BLACK_KEY_COLOR,
    PIANO_ROLL_GRID_COLORS,
    NOTE_HIGHLIGHT_COLOR,
    PIANO_ROLL_NOTE_COLOR,
    PIANO_ROLL_NOTE_OUTLINE_COLOR,
    PREVIEW_NOTE_HIGHLIGHT_COLOR,
    PIANO_ROLL_FONT,
    PIANO_ROLL_TEXT_COLOR,
} from "../../constants";
import { AiFillCaretDown } from "react-icons/ai";
import { Note, Sequencer } from "../../sound/sequencer";
import GridParams from "../../interfaces/GridParams";
import * as React from "react";

interface PianoRollCanvasProps {
    onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    onMouseUp: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    previewNotes: Set<Note>;
    gridParams: GridParams;
    notes: Note[];
    selectedNote: Note | null;
    disabled?: boolean;
}

const PianoRollCanvas: FunctionComponent<PianoRollCanvasProps> = (props) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [headerTranslation, setHeaderTranslation] = useState(0);

    const drawCircle = async (
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        radius: number
    ) => {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.stroke();
    };

    const isBlackKey = useCallback(
        (row: number) =>
            Tone.Frequency(props.gridParams.lowestNote)
                .transpose(props.gridParams.height - row - 1)
                .toNote()
                .includes("#"),
        [props.gridParams]
    );

    const drawVLines = useCallback(
        async (
            ctx: CanvasRenderingContext2D,
            color: string,
            width: number,
            skip: number
        ) => {
            ctx.beginPath();
            for (let i = skip; i < props.gridParams.width; i += skip) {
                ctx.moveTo(i * PIANO_ROLL_NOTE_WIDTH, 0);
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
        async (
            ctx: CanvasRenderingContext2D,
            color: string,
            width: number,
            skip: number,
            offsetStart: number = skip
        ) => {
            ctx.beginPath();
            for (let i = offsetStart; i < props.gridParams.height; i += skip) {
                ctx.moveTo(0, i * PIANO_ROLL_NOTE_HEIGHT);
                ctx.lineTo(ctx.canvas.width, i * PIANO_ROLL_NOTE_HEIGHT);
            }
            ctx.lineWidth = width;
            ctx.strokeStyle = color;
            ctx.closePath();
            ctx.stroke();
        },
        [props.gridParams]
    );

    const drawGrid = useCallback(
        async (ctx: CanvasRenderingContext2D) => {
            ctx.fillStyle = PIANO_ROLL_BG_COLOR;
            ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.fill();
            ctx.fillStyle = PIANO_ROLL_BLACK_KEY_COLOR;
            for (let i = 0; i < props.gridParams.height; i += 1) {
                if (isBlackKey(i)) {
                    ctx.fillRect(
                        0,
                        i * PIANO_ROLL_NOTE_HEIGHT,
                        ctx.canvas.width,
                        PIANO_ROLL_NOTE_HEIGHT
                    );
                }
            }
            drawVLines(ctx, PIANO_ROLL_GRID_COLORS[0], 1, 1);
            drawVLines(ctx, PIANO_ROLL_GRID_COLORS[2], 3, 16);
            drawHLines(ctx, PIANO_ROLL_GRID_COLORS[0], 1, 1);
            drawHLines(ctx, PIANO_ROLL_GRID_COLORS[0], 3, 12, 1);
        },
        [props.gridParams, isBlackKey, drawVLines, drawHLines]
    );

    const drawNote = useCallback(
        async (ctx: CanvasRenderingContext2D, note: Note) => {
            ctx.font = PIANO_ROLL_FONT;
            ctx.strokeStyle = PIANO_ROLL_NOTE_OUTLINE_COLOR;
            const x =
                Sequencer.toneTimeToRollTime(note.time) * PIANO_ROLL_NOTE_WIDTH;
            const y =
                Sequencer.tonePitchToRollPitch(
                    note.pitch,
                    props.gridParams.lowestNote,
                    props.gridParams.height
                ) * PIANO_ROLL_NOTE_HEIGHT;
            const w =
                Sequencer.toneTimeToRollTime(note.length) *
                PIANO_ROLL_NOTE_WIDTH;
            const h = PIANO_ROLL_NOTE_HEIGHT;

            ctx.fillStyle = PIANO_ROLL_NOTE_COLOR;
            ctx.fillRect(x, y, w, h);
            if (note === props.selectedNote)
                ctx.strokeStyle = NOTE_HIGHLIGHT_COLOR;
            else if (props.previewNotes.has(note))
                ctx.strokeStyle = PREVIEW_NOTE_HIGHLIGHT_COLOR;
            ctx.strokeRect(x, y, w, h);
            ctx.fillStyle = PIANO_ROLL_NOTE_COLOR;
            const handleX = x + w - PIANO_ROLL_NOTE_WIDTH / 3;
            const radius = 1;
            const yOffset = PIANO_ROLL_NOTE_WIDTH / 3.5;
            if (note === props.selectedNote)
                ctx.fillStyle = NOTE_HIGHLIGHT_COLOR;
            else if (props.previewNotes.has(note))
                ctx.fillStyle = PREVIEW_NOTE_HIGHLIGHT_COLOR;
            else ctx.fillStyle = PIANO_ROLL_TEXT_COLOR;
            const text = note.pitch.slice(0, -1);
            ctx.fillText(text, x + 2, y + PIANO_ROLL_NOTE_HEIGHT - 6);
            ctx.fillStyle = PIANO_ROLL_NOTE_COLOR;
            drawCircle(ctx, handleX, y + yOffset, radius);
            drawCircle(ctx, handleX, y + h - yOffset, radius);
        },
        [
            props.gridParams.height,
            props.gridParams.lowestNote,
            props.previewNotes,
            props.selectedNote,
        ]
    );

    const drawNotes = useCallback(
        async (ctx: CanvasRenderingContext2D) => {
            props.notes.forEach((n) => {
                drawNote(ctx, n);
            });
        },
        [drawNote, props.notes]
    );

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.height = props.gridParams.height * PIANO_ROLL_NOTE_HEIGHT;
            canvas.width = props.gridParams.width * PIANO_ROLL_NOTE_WIDTH;
            canvas.style.width = `${canvas.width}px`;
            canvas.style.height = `${canvas.height}px`;
            const context = canvas.getContext("2d");
            if (context) {
                drawGrid(context);
                drawNotes(context);
            }
        }
    }, [drawGrid, drawNotes, props.gridParams]);

    const isOnGrid = (e: MouseEvent<HTMLCanvasElement>) => {
        const { offsetY } = e.nativeEvent;
        return offsetY > 0;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            Sequencer.clearOnBeatCallbacks();
            if (!props.disabled) {
                Sequencer.runCallbackOnBeat(() => {
                    setHeaderTranslation(
                        props.gridParams.width *
                            PIANO_ROLL_NOTE_WIDTH *
                            Sequencer.getProgress()
                    );
                });
            }
        }
    }, [props.disabled, props.gridParams.width]);

    return (
        <div
            style={{ width: props.gridParams.width * PIANO_ROLL_NOTE_WIDTH }}
            className="h-screen transition-[width]"
        >
            <div
                className="sticky top-0 left-0 border-b-2 border-dark-primary bg-white transition-[width]"
                style={{
                    width: props.gridParams.width * PIANO_ROLL_NOTE_WIDTH,
                }}
            >
                <div
                    className="w-1 text-black"
                    style={{
                        transform: `translateX(${headerTranslation}px)`,
                    }}
                >
                    <AiFillCaretDown />
                </div>
            </div>
            <canvas
                className="snap-none transition-[width]"
                ref={canvasRef}
                onMouseDown={(e) => isOnGrid(e) && props.onMouseDown(e)}
                onMouseMove={(e) => isOnGrid(e) && props.onMouseMove(e)}
                onMouseUp={(e) => isOnGrid(e) && props.onMouseUp(e)}
                onContextMenu={(e) => e.preventDefault()}
            />
        </div>
    );
};

PianoRollCanvas.defaultProps = {
    disabled: false,
};

export default PianoRollCanvas;
