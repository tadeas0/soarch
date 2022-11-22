import { useContext } from "react";
import { BsPauseFill, BsFillPlayFill } from "react-icons/bs";
import { MdOutlineSearch, MdSearchOff, MdDelete } from "react-icons/md";
import { CgPiano } from "react-icons/cg";
import { MIN_BPM, MAX_BPM } from "../../constants";
import InstrumentSelector from "./instrumentSelector";
import { SongParams } from "./songTabs";
import "./topButtons.css";
import { FaSave } from "react-icons/fa";
import { AvailabilityContext } from "../../context/serverAvailabilityContext";
import BPMInput from "./bpmInput";
import Metronome from "./metronome";

const defaultProps = {
    disabled: false,
};

type TopButtonsProps = {
    onPlayClick: () => void;
    onSubmit: () => void;
    onClear: () => void;
    onRemoveMeasure: () => void;
    onAddMeasure: () => void;
    onChangeBPM: (bpm: number) => void;
    selectedSong: SongParams;
    isPlaying: boolean;
    playbackEnabled: boolean;
    disabled?: boolean;
} & typeof defaultProps;

const TopButtons = (props: TopButtonsProps) => {
    const { isServerAvailable } = useContext(AvailabilityContext);

    const getPlayIcon = () => {
        if (props.disabled) return <BsFillPlayFill />;
        else if (props.isPlaying) return <BsPauseFill />;
        else return <BsFillPlayFill />;
    };

    return (
        <div className="top-button-container">
            <button
                className="top-button"
                onClick={props.onPlayClick}
                disabled={
                    !(
                        props.selectedSong.bpm >= MIN_BPM &&
                        props.selectedSong.bpm <= MAX_BPM
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
            <div className="top-spacer" />
            <BPMInput
                value={props.selectedSong.bpm}
                onChange={props.onChangeBPM}
                increment={5}
                min={30}
                max={250}
                disabled={props.isPlaying || props.disabled}
            />
            <div className="top-spacer" />
            <div className="top-spacer" />
            <button
                className="top-button"
                onClick={props.onClear}
                disabled={props.disabled}
            >
                <MdDelete />
            </button>
            <button className="top-button" disabled={props.disabled}>
                <FaSave />
            </button>
            <button
                className="top-button"
                onClick={() =>
                    props.selectedSong.gridParams.width && props.onSubmit()
                }
                disabled={!isServerAvailable || props.disabled}
            >
                {isServerAvailable ? <MdOutlineSearch /> : <MdSearchOff />}
            </button>
        </div>
    );
};

TopButtons.defaultProps = {
    disabled: false,
};

export default TopButtons;
