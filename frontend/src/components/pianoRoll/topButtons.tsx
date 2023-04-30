/* eslint-disable @typescript-eslint/no-use-before-define */
import {
    BsPauseFill,
    BsFillPlayFill,
    BsRecord,
    BsRecordFill,
} from "react-icons/bs";
import { CgPiano } from "react-icons/cg";
import { TbClock } from "react-icons/tb";
import { MIN_BPM, MAX_BPM } from "../../constants";
import InstrumentSelector from "./instrumentSelector";
import BPMInput from "./bpmInput";
import Metronome from "./metronome";
import { usePianoRollStore } from "../../stores/pianoRollStore";
import Button from "../basic/button";
import * as React from "react";
import * as Tone from "tone";
import { useRef } from "react";
import useKeyboardListener from "../../hooks/useKeyboardListener";
import { usePlaybackMachine } from "../../context/pianorollContext";

const defaultProps = {
    disabled: false,
};

type TopButtonsProps = {
    disabled?: boolean;
} & typeof defaultProps;

const TopButtons = (props: TopButtonsProps) => {
    const [songs, selectedIndex] = usePianoRollStore((state) => [
        state.songs,
        state.selectedIndex,
    ]);
    const [playbackStateMachine, send] = usePlaybackMachine();
    const changeBPM = usePianoRollStore((state) => state.changeBPM);
    const [isPianoHidden, setIsPianoHidden] = usePianoRollStore((state) => [
        state.isPianoHidden,
        state.setIsPianoHidden,
    ]);
    const isRecording =
        playbackStateMachine.matches("recording") ||
        playbackStateMachine.matches("countIn");
    const isPlaying = playbackStateMachine.matches("queryPlaying");
    const metronomeSampler = useRef<Tone.Sampler | null>(null);
    if (!metronomeSampler.current) {
        metronomeSampler.current = new Tone.Sampler({
            urls: {
                G4: "/samples/metronome_down.mp3",
                C4: "/samples/metronome_up.mp3",
            },
            release: 1,
        }).toDestination();
    }

    const selectedSong = songs[selectedIndex];

    const handlePlayClick = async () => {
        send("PLAY_QUERY");
    };

    const handleRecordClick = async () => {
        send("RECORD");
    };

    const getPlayIcon = () => {
        if (props.disabled) return <BsFillPlayFill />;
        if (isPlaying || isRecording) return <BsPauseFill />;
        return <BsFillPlayFill />;
    };

    const getRecordIcon = () => {
        if (playbackStateMachine.matches("countIn")) {
            return <TbClock size={46} />;
        }
        if (isRecording) {
            return <BsRecord />;
        }
        return <BsRecordFill />;
    };

    const handleKeyboardDown = (e: KeyboardEvent) => {
        if (e.key === " ") {
            e.preventDefault();
            handlePlayClick();
        }
    };

    useKeyboardListener(() => {}, handleKeyboardDown);

    return (
        <>
            <Button
                className="col-span-1 flex items-center justify-center text-4xl xl:text-6xl"
                id="play-button"
                onClick={handlePlayClick}
                disabled={
                    !(
                        selectedSong.bpm >= MIN_BPM &&
                        selectedSong.bpm <= MAX_BPM
                    ) || props.disabled
                }
            >
                {getPlayIcon()}
            </Button>
            <BPMInput
                id="bpm-input"
                value={selectedSong.bpm}
                onChange={(value: number) => changeBPM(value)}
                increment={5}
                min={30}
                max={250}
                disabled={isPlaying || isRecording || props.disabled}
            />
            <Button
                id="record-button"
                className={`col-span-1 flex items-center justify-center text-4xl xl:text-6xl ${
                    isRecording ? "bg-warn" : ""
                }`}
                onClick={handleRecordClick}
            >
                {getRecordIcon()}
            </Button>
            <Metronome disabled={props.disabled} />
            <Button
                className="col-span-1 flex items-center justify-center text-4xl xl:text-6xl"
                id="piano-button"
                pressed={!isPianoHidden}
                onClick={() => setIsPianoHidden(!isPianoHidden)}
                disabled={props.disabled}
            >
                <CgPiano />
            </Button>
            <InstrumentSelector disabled={props.disabled} />
        </>
    );
};

TopButtons.defaultProps = {
    disabled: false,
};

export default TopButtons;
