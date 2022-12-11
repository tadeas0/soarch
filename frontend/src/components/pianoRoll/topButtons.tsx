import { BsPauseFill, BsFillPlayFill } from "react-icons/bs";
import * as React from "react";
import { CgPiano } from "react-icons/cg";
import { MIN_BPM, MAX_BPM } from "../../constants";
import InstrumentSelector from "./instrumentSelector";
import { FaSave } from "react-icons/fa";
import BPMInput from "./bpmInput";
import Metronome from "./metronome";
import { usePianoRollStore } from "../../stores/pianoRollStore";
import { Sequencer } from "../../sound/sequencer";
import Button from "../basic/button";
import useSynth from "../../hooks/sequencer/useSynth";

const defaultProps = {
    disabled: false,
};

type TopButtonsProps = {
    setIsDownloading: (v: boolean) => void;
    isPlaying: boolean;
    onPlayClick: () => void;
    disabled?: boolean;
} & typeof defaultProps;

const TopButtons = (props: TopButtonsProps) => {
    const [songs, selectedIndex] = usePianoRollStore((state) => [
        state.songs,
        state.selectedIndex,
    ]);
    const changeBPM = usePianoRollStore((state) => state.changeBPM);
    const [isPianoHidden, setIsPianoHidden] = usePianoRollStore((state) => [
        state.isPianoHidden,
        state.setIsPianoHidden,
    ]);
    const { synth } = useSynth();

    const selectedSong = songs[selectedIndex];

    const getPlayIcon = () => {
        if (props.disabled) return <BsFillPlayFill />;
        if (props.isPlaying) return <BsPauseFill />;
        return <BsFillPlayFill />;
    };

    const handleSave = async () => {
        try {
            props.setIsDownloading(true);
            await Sequencer.saveToFile(
                selectedSong.notes,
                selectedSong.bpm,
                selectedSong.gridParams.width,
                selectedSong.name,
                synth
            );
        } catch (err) {
            console.error(err);
        } finally {
            props.setIsDownloading(false);
        }
    };

    const handlePlayClick = async () => {
        props.onPlayClick();
    };

    return (
        <>
            <Button
                className="col-span-1 flex items-center justify-center text-6xl"
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
            <Metronome disabled={props.disabled} />
            <BPMInput
                id="bpm-input"
                value={selectedSong.bpm}
                onChange={(value: number) => changeBPM(value)}
                increment={5}
                min={30}
                max={250}
                disabled={props.isPlaying || props.disabled}
            />
            <Button
                className="col-span-1 flex items-center justify-center text-6xl"
                id="piano-button"
                pressed={!isPianoHidden}
                onClick={() => setIsPianoHidden(!isPianoHidden)}
                disabled={props.disabled}
            >
                <CgPiano />
            </Button>
            <InstrumentSelector disabled={props.disabled} />
            <Button
                id="export-button"
                className="col-span-1 flex items-center justify-center text-6xl"
                disabled={props.disabled}
                onClick={handleSave}
            >
                <FaSave />
            </Button>
        </>
    );
};

TopButtons.defaultProps = {
    disabled: false,
};

export default TopButtons;
