import * as React from "react";
import { useEffect, useState, useContext, FunctionComponent } from "react";
import {
    DEFAULT_NOTE_LENGTH,
    MEASURE_LENGTH,
    MIN_BPM,
    MAX_BPM,
    DEFAULT_BPM,
} from "../constants";
import { BsFillPlayFill, BsPauseFill } from "react-icons/bs";
import { MdDelete, MdOutlineSearch, MdSearchOff } from "react-icons/md";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { TiMediaRecord, TiMediaRecordOutline } from "react-icons/ti";
import SixteenthNote from "../notes/sixteenth.svg";
import EighthNote from "../notes/eighth.svg";
import QuarterNote from "../notes/quarter.svg";
import HalfNote from "../notes/half.svg";
import WholeNote from "../notes/whole.svg";
import usePlayback from "../hooks/usePlayback";
import useKeyboardListener from "../hooks/useKeyboardListener";
import { Note, Sequencer } from "../sequencer";
import "./pianoRoll.css";
import PianoRollGrid, { GridParams } from "./pianoRollGrid";
import { AvailabilityContext } from "../context/serverAvailabilityContext";

interface PianoRollProps {
    gridParams: GridParams;
    bpm: number;
    notes?: Note[];
    onSubmit: (notes: Note[], gridLength: number) => void;
}

const PianoRoll: FunctionComponent<PianoRollProps> = (props) => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [gridParams, setGridParams] = useState<GridParams>(props.gridParams);
    const [noteLength, setNoteLength] = useState(DEFAULT_NOTE_LENGTH);
    const [isPlaying, handleStart, handleStop] = usePlayback();
    const [currentBPM, setCurrentBPM] = useState(DEFAULT_BPM);
    const { isServerAvailable } = useContext(AvailabilityContext);

    const [playbackEnabled, setPlaybackEnabled] = useKeyboardListener(
        (note: Note) => {
            if (isPlaying) {
                const newNotes = [...notes, note];
                Sequencer.fillBuffer([note], gridParams.width);
                setNotes(newNotes);
            }
        },
        gridParams.lowestNote
    );

    useEffect(() => {
        setGridParams(props.gridParams);
        setCurrentBPM(props.bpm);
        if (props.notes) setNotes(props.notes);
        handleStop();
        // eslint-disable-next-line
    }, [props.notes, props.gridParams, props.bpm]);

    const handleAddNote = (note: Note) => {
        Sequencer.addNoteToBuffer(note);

        const newNotes = [...notes, note];
        setNotes(newNotes);
    };

    const handleDeleteNote = (note: Note) => {
        Sequencer.deleteNoteFromBuffer(note);
        setNotes((curr) => curr.filter((n) => n !== note));
    };

    const handleClear = () => {
        setNotes([]);
        if (isPlaying) {
            handleStop();
        }
    };

    const handleChangeNoteLength = () => {
        setNoteLength((noteLength * 2) % 31);
    };

    const handlePlayClick = () => {
        if (!isPlaying) {
            let bpm = DEFAULT_BPM;
            if (currentBPM >= MIN_BPM && currentBPM <= MAX_BPM)
                bpm = currentBPM;
            handleStart(notes, bpm, gridParams.width);
        } else {
            handleStop();
        }
    };

    const handleAddMeasure = () => {
        setGridParams({
            ...gridParams,
            width: gridParams.width + MEASURE_LENGTH,
        });
    };

    const canRemoveMeasure = () => {
        return gridParams.width > 2 * MEASURE_LENGTH;
    };

    const handleRemoveMeasure = () => {
        if (canRemoveMeasure()) {
            const newGridLength = gridParams.width - MEASURE_LENGTH;
            const newNotes = notes.filter((n) => {
                return (
                    Sequencer.toneTimeToRollTime(n.time) +
                        Sequencer.toneTimeToRollTime(n.length) <
                    newGridLength
                );
            });
            setGridParams({ ...gridParams, width: newGridLength });
            handleStop();
            setNotes(newNotes);
        }
    };

    const handleChangeBPM = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const value = Number(e.target.value);
        e.target.value.length <= 3 && setCurrentBPM(value);
    };

    const renderNoteIcon = () => {
        const iconDict: { [key: number]: JSX.Element } = {
            1: <img src={SixteenthNote} width={30} height={40} alt="1" />,
            2: <img src={EighthNote} width={30} height={40} alt="2" />,
            4: <img src={QuarterNote} width={30} height={40} alt="4" />,
            8: <img src={HalfNote} width={30} height={40} alt="8" />,
            16: <img src={WholeNote} width={30} height={10} alt="16" />,
        };

        return iconDict[noteLength];
    };

    return (
        <div className="pianoroll">
            <div className="button-container">
                <button
                    onClick={handlePlayClick}
                    disabled={!(currentBPM >= MIN_BPM && currentBPM <= MAX_BPM)}
                >
                    {isPlaying ? <BsPauseFill /> : <BsFillPlayFill />}
                </button>
                <button
                    className="right"
                    onClick={() =>
                        gridParams.width &&
                        props.onSubmit(notes, gridParams.width)
                    }
                    disabled={!isServerAvailable}
                >
                    {isServerAvailable ? <MdOutlineSearch /> : <MdSearchOff />}
                </button>
                <button onClick={handleClear}>
                    <MdDelete />
                </button>
                <button
                    onClick={handleRemoveMeasure}
                    disabled={!canRemoveMeasure()}
                >
                    <AiOutlineMinus />
                </button>
                <button onClick={handleAddMeasure}>
                    <AiOutlinePlus />
                </button>
                <button onClick={handleChangeNoteLength}>
                    {renderNoteIcon()}
                </button>
                <button
                    className={playbackEnabled ? "recording" : ""}
                    onClick={() => setPlaybackEnabled(!playbackEnabled)}
                >
                    {playbackEnabled ? (
                        <TiMediaRecord />
                    ) : (
                        <TiMediaRecordOutline />
                    )}
                </button>
                <input
                    type="number"
                    value={currentBPM}
                    onChange={handleChangeBPM}
                    max={250}
                    min={30}
                    disabled={isPlaying}
                ></input>
            </div>
            <PianoRollGrid
                onAddNote={handleAddNote}
                onDeleteNote={handleDeleteNote}
                gridParams={gridParams}
                notes={notes}
            />
        </div>
    );
};

export default PianoRoll;
