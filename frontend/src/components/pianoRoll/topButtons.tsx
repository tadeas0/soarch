import { BsPauseFill, BsFillPlayFill } from "react-icons/bs";
import { MdDelete } from "react-icons/md";
import { CgPiano } from "react-icons/cg";
import { MIN_BPM, MAX_BPM } from "../../constants";
import InstrumentSelector from "./instrumentSelector";
import "./topButtons.css";
import { FaHeadphonesAlt, FaSave } from "react-icons/fa";
import BPMInput from "./bpmInput";
import Metronome from "./metronome";
import { usePianoRollStore } from "../../stores/pianoRollStore";

const defaultProps = {
    disabled: false,
};

type TopButtonsProps = {
    disabled?: boolean;
} & typeof defaultProps;

const TopButtons = (props: TopButtonsProps) => {
    const [rollPlayback, setRollPlayback] = usePianoRollStore((state) => [
        state.playbackEnabled,
        state.setPlaybackEnabled,
    ]);
    const [songs, selectedIndex] = usePianoRollStore((state) => [
        state.songs,
        state.selectedIndex,
    ]);
    const [isRollPlaying, setIsRollPlaying, changeBPM, clear] =
        usePianoRollStore((state) => [
            state.isRollPlaying,
            state.setIsRollPlaying,
            state.changeBPM,
            state.clear,
        ]);
    const [isPianoHidden, setIsPianoHidden] = usePianoRollStore((state) => [
        state.isPianoHidden,
        state.setIsPianoHidden,
    ]);

    const selectedSong = songs[selectedIndex];

    const getPlayIcon = () => {
        if (props.disabled) return <BsFillPlayFill />;
        else if (isRollPlaying) return <BsPauseFill />;
        else return <BsFillPlayFill />;
    };

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
            <button
                className={"top-button" + (isPianoHidden ? "" : " pressed")}
                onClick={() => setIsPianoHidden(!isPianoHidden)}
                disabled={props.disabled}
            >
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
