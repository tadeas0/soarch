import { FunctionComponent, useContext } from "react";
import { BsPauseFill, BsFillPlayFill } from "react-icons/bs";
import { MdOutlineSearch, MdSearchOff, MdDelete } from "react-icons/md";
import { CgPiano } from "react-icons/cg";
import { GiMetronome } from "react-icons/gi";
import { MIN_BPM, MAX_BPM } from "../../constants";
import InstrumentSelector from "./instrumentSelector";
import { SongParams } from "./songTabs";
import "./topButtons.css";
import { FaSave } from "react-icons/fa";
import { AvailabilityContext } from "../../context/serverAvailabilityContext";

interface TopButtonsProps {
    onPlayClick: () => void;
    onSubmit: () => void;
    onClear: () => void;
    onRemoveMeasure: () => void;
    onAddMeasure: () => void;
    togglePlayback: () => void;
    onChangeBPM: (bpm: number) => void;
    selectedSong: SongParams;
    isPlaying: boolean;
    playbackEnabled: boolean;
}

const TopButtons: FunctionComponent<TopButtonsProps> = (props) => {
    const { isServerAvailable } = useContext(AvailabilityContext);

    return (
        <div className="top-button-container">
            <button
                className="top-button"
                onClick={props.onPlayClick}
                disabled={
                    !(
                        props.selectedSong.bpm >= MIN_BPM &&
                        props.selectedSong.bpm <= MAX_BPM
                    )
                }
            >
                {props.isPlaying ? <BsPauseFill /> : <BsFillPlayFill />}
            </button>
            <button className="top-button">
                <CgPiano />
            </button>
            <InstrumentSelector />
            <button className="top-button">
                <GiMetronome />
            </button>
            <div className="top-spacer" />
            <input
                type="number"
                value={props.selectedSong.bpm}
                onChange={(e) => {
                    e.preventDefault();
                    const value = Number(e.target.value);
                    if (e.target.value.length <= 3) props.onChangeBPM(value);
                }}
                max={250}
                min={30}
                disabled={props.isPlaying}
            ></input>
            <div className="top-spacer" />
            <div className="top-spacer" />
            <button className="top-button" onClick={props.onClear}>
                <MdDelete />
            </button>
            <button className="top-button">
                <FaSave />
            </button>
            <button
                className="top-button"
                onClick={() =>
                    props.selectedSong.gridParams.width && props.onSubmit()
                }
                disabled={!isServerAvailable}
            >
                {isServerAvailable ? <MdOutlineSearch /> : <MdSearchOff />}
            </button>
        </div>
    );
};

export default TopButtons;
