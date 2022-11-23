import { BsPauseFill, BsFillPlayFill } from "react-icons/bs";
import { MdDelete } from "react-icons/md";
import { CgPiano } from "react-icons/cg";
import { MIN_BPM, MAX_BPM } from "../../constants";
import InstrumentSelector from "./instrumentSelector";
import "./topButtons.css";
import { FaHeadphonesAlt, FaSave } from "react-icons/fa";
import BPMInput from "./bpmInput";
import Metronome from "./metronome";
import {
    PianoRollActionType,
    usePianoRollDispatch,
    usePianoRollState,
} from "../../context/pianoRollContext";
import useKeyboardListener from "../../hooks/useKeyboardListener";
import { Note, Sequencer } from "../../sound/sequencer";
import { useEffect } from "react";

const defaultProps = {
    disabled: false,
};

type TopButtonsProps = {
    disabled?: boolean;
} & typeof defaultProps;

const TopButtons = (props: TopButtonsProps) => {
    const state = usePianoRollState();
    const dispatch = usePianoRollDispatch();

    const selectedSong = state.songs[state.selectedIndex];

    const getPlayIcon = () => {
        if (props.disabled) return <BsFillPlayFill />;
        else if (state.isRollPlaying) return <BsPauseFill />;
        else return <BsFillPlayFill />;
    };

    const [, setPlaybackEnabled] = useKeyboardListener((note: Note) => {
        const s = state.songs[state.selectedIndex];
        if (state.isRollPlaying) {
            Sequencer.fillBuffer([note], s.gridParams.width);
            dispatch({ type: PianoRollActionType.ADD_NOTE, payload: note });
        }
    }, state.songs[state.selectedIndex].gridParams.lowestNote);

    useEffect(() => {
        setPlaybackEnabled(state.playbackEnabled);
    }, [setPlaybackEnabled, state.playbackEnabled]);

    return (
        <div className="top-button-container">
            <button
                className="top-button"
                onClick={() =>
                    dispatch({ type: PianoRollActionType.PLAY_ROLL })
                }
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
                className={
                    "top-button" + (state.playbackEnabled ? " pressed" : "")
                }
                onClick={() =>
                    dispatch({ type: PianoRollActionType.TOGGLE_PLAYBACK })
                }
                disabled={props.disabled}
            >
                <FaHeadphonesAlt />
            </button>
            <div className="top-spacer" />
            <BPMInput
                value={selectedSong.bpm}
                onChange={(value: number) =>
                    dispatch({
                        type: PianoRollActionType.CHANGE_BPM,
                        payload: value,
                    })
                }
                increment={5}
                min={30}
                max={250}
                disabled={state.isRollPlaying || props.disabled}
            />
            <div className="top-spacer" />
            <button
                className="top-button"
                onClick={() => dispatch({ type: PianoRollActionType.CLEAR })}
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
