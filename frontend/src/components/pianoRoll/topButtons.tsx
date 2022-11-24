import { BsPauseFill, BsFillPlayFill } from "react-icons/bs";
import { MdDelete } from "react-icons/md";
import { CgPiano } from "react-icons/cg";
import { MIN_BPM, MAX_BPM } from "../../constants";
import InstrumentSelector from "./instrumentSelector";
import "./topButtons.css";
import { FaHeadphonesAlt, FaSave } from "react-icons/fa";
import BPMInput from "./bpmInput";
import Metronome from "./metronome";
import useKeyboardListener from "../../hooks/useKeyboardListener";
import { Note, Sequencer } from "../../sound/sequencer";
import { useEffect } from "react";
import { usePianoRollStore } from "../../stores/pianoRollStore";

const defaultProps = {
    disabled: false,
};

type TopButtonsProps = {
    disabled?: boolean;
} & typeof defaultProps;

const TopButtons = (props: TopButtonsProps) => {
    const [setRollPlayback, rollPlayback] = usePianoRollStore((state) => [
        state.setPlaybackEnabled,
        state.playbackEnabled,
    ]);
    const [songs, selectedIndex, addNote] = usePianoRollStore((state) => [
        state.songs,
        state.selectedIndex,
        state.addNote,
    ]);
    const [isRollPlaying, setIsRollPlaying, changeBPM, clear] =
        usePianoRollStore((state) => [
            state.isRollPlaying,
            state.setIsRollPlaying,
            state.changeBPM,
            state.clear,
        ]);

    const selectedSong = songs[selectedIndex];

    const getPlayIcon = () => {
        if (props.disabled) return <BsFillPlayFill />;
        else if (isRollPlaying) return <BsPauseFill />;
        else return <BsFillPlayFill />;
    };

    const [, setPlaybackEnabled] = useKeyboardListener((note: Note) => {
        const s = songs[selectedIndex];
        if (isRollPlaying) {
            Sequencer.fillBuffer([note], s.gridParams.width);
            addNote(note);
        }
    }, songs[selectedIndex].gridParams.lowestNote);

    useEffect(() => {
        setPlaybackEnabled(rollPlayback);
    }, [setPlaybackEnabled, rollPlayback]);

    return (
        <div className="top-button-container">
            <button
                className="top-button"
                onClick={() => setIsRollPlaying(!isRollPlaying)}
                disabled={
                    !(
                        selectedSong.bpm >= MIN_BPM &&
                        selectedSong.bpm <= MAX_BPM
                    ) || props.disabled
                }
            >
                {getPlayIcon()}
            </button>
            <button className="top-button" disabled={props.disabled}>
                <CgPiano />
            </button>
            <InstrumentSelector disabled={props.disabled} />
            <Metronome disabled={props.disabled} />
            <button
                className={"top-button" + (rollPlayback ? " pressed" : "")}
                onClick={() => setRollPlayback(!rollPlayback)}
                disabled={props.disabled}
            >
                <FaHeadphonesAlt />
            </button>
            <div className="top-spacer" />
            <BPMInput
                value={selectedSong.bpm}
                onChange={(value: number) => changeBPM(value)}
                increment={5}
                min={30}
                max={250}
                disabled={isRollPlaying || props.disabled}
            />
            <div className="top-spacer" />
            <button
                className="top-button"
                onClick={clear}
                disabled={props.disabled}
            >
                <MdDelete />
            </button>
            <button className="top-button" disabled={props.disabled}>
                <FaSave />
            </button>
        </div>
    );
};

TopButtons.defaultProps = {
    disabled: false,
};

export default TopButtons;
