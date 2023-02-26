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
import { Note } from "../../interfaces/Note";
import GridParams from "../../interfaces/GridParams";
import * as React from "react";
import useSynth from "../../hooks/sequencer/useSynth";
import {
    rollPitchToTonePitch,
    tonePitchToRollPitch,
    toneTimeToRollTime,
} from "../../common/coordConversion";
import { Sequencer } from "../../hooks/sequencer/useSequencer";

interface PianoRollCanvasProps {
    onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    onMouseUp: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    onDoubleClick: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    rollSequencer: Sequencer;
    previewNotes: Set<Note>;
    gridParams: GridParams;
    notes: Note[];
    selectedNote: Note | null;
}

const PianoRollCanvas: FunctionComponent<PianoRollCanvasProps> = (props) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [alreadyScrolled, setAlreadyScrolled] = useState(false);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const { triggerAttackRelease } = useSynth();
    const [preventMouseMove, setPreventMouseMove] = useState(false);
    const headerWidth = (props.gridParams.width - 1) * PIANO_ROLL_NOTE_WIDTH;
    const { progress } = props.rollSequencer;
    const headerTranslation = headerWidth * progress;

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
            drawVLines(ctx, PIANO_ROLL_GRID_COLORS[0], 1, 2);
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
            const x = toneTimeToRollTime(note.time) * PIANO_ROLL_NOTE_WIDTH;
            const y =
                tonePitchToRollPitch(note.pitch, props.gridParams) *
                PIANO_ROLL_NOTE_HEIGHT;
            const w = toneTimeToRollTime(note.length) * PIANO_ROLL_NOTE_WIDTH;
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
            const text = note.pitch.toNote().slice(0, -1);
            ctx.fillText(text, x + 2, y + PIANO_ROLL_NOTE_HEIGHT - 6);
            ctx.fillStyle = PIANO_ROLL_NOTE_COLOR;
            drawCircle(ctx, handleX, y + yOffset, radius);
            drawCircle(ctx, handleX, y + h - yOffset, radius);
        },
        [props.gridParams, props.previewNotes, props.selectedNote]
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
        // Scroll to the first note and center it on screen
        if (canvasContainerRef.current && !alreadyScrolled) {
            setAlreadyScrolled(true);
            let scrollPos = canvasContainerRef.current.clientHeight / 2 + 200;
            if (props.notes.length > 0) {
                const rollHeight = tonePitchToRollPitch(
                    props.notes[0].pitch,
                    props.gridParams
                );
                scrollPos =
                    (rollHeight + 1) * PIANO_ROLL_NOTE_HEIGHT -
                    canvasContainerRef.current.clientHeight / 2;
            }
            canvasContainerRef.current.scroll({
                top: scrollPos,
            });
        }
    }, [
        alreadyScrolled,
        props.notes,
        props.gridParams.lowestNote,
        props.gridParams.height,
        props.gridParams,
    ]);

    const renderPiano = () => {
        const previewPitches = [...props.previewNotes].map((n) =>
            n.pitch.toNote()
        );
        const children = [];
        for (let i = 0; i < props.gridParams.height; i++) {
            const pitch = rollPitchToTonePitch(i, props.gridParams);
            let classes = "bg-white";
            if (previewPitches.includes(pitch.toNote()))
                classes = "bg-medium-primary";
            else if (isBlackKey(i)) classes = "bg-black";
            if (isBlackKey(i)) classes += " w-4/6";
            else classes += " w-full";
            if (props.selectedNote?.pitch.toNote() === pitch.toNote())
                classes += " border-2 border-light-primary";
            children.push(
                // eslint-disable-next-line jsx-a11y/no-static-element-interactions
                <div
                    aria-label={pitch.toNote()}
                    style={{
                        height: PIANO_ROLL_NOTE_HEIGHT,
                    }}
                    className={`p-0 text-right text-sm outline-none ${classes}`}
                    onClick={() => {
                        triggerAttackRelease(pitch);
                    }}
                    onKeyDown={() => {
                        triggerAttackRelease(pitch);
                    }}
                >
                    {pitch.toNote().slice(0, -1) === "C" && pitch.toNote()}
                </div>
            );
        }
        return (
            <div
                className="sticky top-5 left-0 w-14 border-r-2 border-black bg-white"
                style={{
                    marginTop:
                        -PIANO_ROLL_NOTE_HEIGHT * props.gridParams.height,
                }}
            >
                {children}
            </div>
        );
    };

    return (
        <div
            ref={canvasContainerRef}
            className="relative h-screen max-h-full max-w-full overflow-scroll transition-[width]"
        >
            {renderPiano()}
            <div
                className="sticky top-0 left-0 h-5 border-b-2 border-dark-primary bg-white transition-[width]"
                style={{
                    minWidth: props.gridParams.width * PIANO_ROLL_NOTE_WIDTH,
                }}
            >
                <div
                    className="ml-14 w-1 text-black"
                    style={{
                        transform: `translateX(${headerTranslation}px)`,
                    }}
                >
                    <AiFillCaretDown />
                </div>
            </div>
            <canvas
                className="ml-14 snap-none transition-[width]"
                style={{
                    minWidth: props.gridParams.width * PIANO_ROLL_NOTE_WIDTH,
                }}
                ref={canvasRef}
                onMouseDown={(e) => isOnGrid(e) && props.onMouseDown(e)}
                onMouseMove={(e) =>
                    !preventMouseMove && isOnGrid(e) && props.onMouseMove(e)
                }
                onMouseUp={(e) => isOnGrid(e) && props.onMouseUp(e)}
                onDoubleClick={(e) => isOnGrid(e) && props.onDoubleClick(e)}
                // This is a hack to prevent 'mousemove' events on touchscreens
                onTouchStart={() => setPreventMouseMove(true)}
                onClick={() => setPreventMouseMove(false)}
                onContextMenu={(e) => e.preventDefault()}
            />
        </div>
    );
};

export default PianoRollCanvas;
