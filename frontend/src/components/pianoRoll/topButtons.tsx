import { FunctionComponent } from "react";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { BsPauseFill, BsFillPlayFill } from "react-icons/bs";
import { MdOutlineSearch, MdSearchOff, MdDelete } from "react-icons/md";
import { TiMediaRecord, TiMediaRecordOutline } from "react-icons/ti";
import { MIN_BPM, MAX_BPM, MEASURE_LENGTH } from "../../constants";
import InstrumentSelector from "./instrumentSelector";
import { SongParams } from "./songTabs";

interface TopButtonsProps {
    onPlayClick: () => void;
    onSubmit: () => void;
    onClear: () => void;
    onRemoveMeasure: () => void;
    onAddMeasure: () => void;
    togglePlayback: () => void;
    onChangeBPM: (bpm: number) => void;
    selectedSong: SongParams;
    isServerAvailable: boolean;
    isPlaying: boolean;
    playbackEnabled: boolean;
}

const TopButtons: FunctionComponent<TopButtonsProps> = (props) => {
    const canRemoveMeasure = () => {
        return props.selectedSong.gridParams.width > 2 * MEASURE_LENGTH;
    };

    return (
        <div className="button-container">
            <button
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
            <InstrumentSelector />
            <button
                className="right"
                onClick={() =>
                    props.selectedSong.gridParams.width && props.onSubmit()
                }
                disabled={!props.isServerAvailable}
            >
                {props.isServerAvailable ? (
                    <MdOutlineSearch />
                ) : (
                    <MdSearchOff />
                )}
            </button>
            <button onClick={props.onClear}>
                <MdDelete />
            </button>
            <button
                onClick={props.onRemoveMeasure}
                disabled={!canRemoveMeasure()}
            >
                <AiOutlineMinus />
            </button>
            <button onClick={props.onAddMeasure}>
                <AiOutlinePlus />
            </button>
            <button
                className={props.playbackEnabled ? "recording" : ""}
                onClick={props.togglePlayback}
            >
                {props.playbackEnabled ? (
                    <TiMediaRecord />
                ) : (
                    <TiMediaRecordOutline />
                )}
            </button>
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
        </div>
    );
};

export default TopButtons;
