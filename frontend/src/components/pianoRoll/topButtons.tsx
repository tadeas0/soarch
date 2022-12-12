import {
    BsPauseFill,
    BsFillPlayFill,
    BsRecord,
    BsRecordFill,
} from "react-icons/bs";
import * as React from "react";
import { CgPiano } from "react-icons/cg";
import { MIN_BPM, MAX_BPM } from "../../constants";
import InstrumentSelector from "./instrumentSelector";
import { FaSave } from "react-icons/fa";
import BPMInput from "./bpmInput";
import Metronome from "./metronome";
import { usePianoRollStore } from "../../stores/pianoRollStore";
import Button from "../basic/button";
import useSynth from "../../hooks/sequencer/useSynth";
import saveToFile from "../../common/saveTrack";
import useSequencer from "../../hooks/sequencer/useSequencer";
import { rollTimeToToneTime } from "../../common/coordConversion";
import * as Tone from "tone";
import { useRef, useState } from "react";

const defaultProps = {
    disabled: false,
};

type TopButtonsProps = {
    setIsDownloading: (v: boolean) => void;
    disabled?: boolean;
} & typeof defaultProps;

const TopButtons = (props: TopButtonsProps) => {
    const [songs, selectedIndex, isRollPlaying, setIsRollPlaying] =
        usePianoRollStore((state) => [
            state.songs,
            state.selectedIndex,
            state.isRollPlaying,
            state.setIsRollPlaying,
        ]);
    const { stop, play } = useSequencer();
    const changeBPM = usePianoRollStore((state) => state.changeBPM);
    const [isPianoHidden, isRecording, setIsPianoHidden, setIsRecording] =
        usePianoRollStore((state) => [
            state.isPianoHidden,
            state.isRecording,
            state.setIsPianoHidden,
            state.setIsRecording,
        ]);
    const [countDown, setCountDown] = useState(0);
    const countInPart = useRef(new Tone.Part());
    const repeatEvent = useRef<number | null>(null);
    const changeEvent = useRef<number | null>(null);
    const metronomeSampler = new Tone.Sampler({
        urls: {
            G4: "/samples/metronome_down.mp3",
            C4: "/samples/metronome_up.mp3",
        },
        release: 1,
    }).toDestination();
    const { synth } = useSynth();

    const selectedSong = songs[selectedIndex];

    const getPlayIcon = () => {
        if (props.disabled) return <BsFillPlayFill />;
        if (isRollPlaying) return <BsPauseFill />;
        return <BsFillPlayFill />;
    };

    const handleSave = async () => {
        try {
            props.setIsDownloading(true);
            await saveToFile(
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
        stop();
        if (isRollPlaying) {
            setIsRollPlaying(false);
        } else {
            if (countDown > 0) {
                setCountDown(0);
                if (repeatEvent.current)
                    Tone.Transport.clear(repeatEvent.current);
                if (changeEvent.current)
                    Tone.Transport.clear(changeEvent.current);
                countInPart.current.dispose();
            }
            setIsRollPlaying(true);
            play(
                selectedSong.notes,
                selectedSong.bpm,
                rollTimeToToneTime(selectedSong.gridParams.width)
            );
        }
    };

    const handleRecord = async () => {
        if (isRollPlaying) {
            setIsRecording(true);
            return;
        }
        if (Tone.context.state !== "running") await Tone.start();
        stop();
        const metronomeNotes = [];
        for (let i = 0; i < 4; i++) {
            const pitch = i % 4 === 0 ? "G4" : "C4";
            metronomeNotes.push({ time: `0:${i}:0`, pitch });
        }
        countInPart.current = new Tone.Part((time, note) => {
            metronomeSampler.triggerAttackRelease(note.pitch, "0:0:1", time);
        }, metronomeNotes).start(0);
        repeatEvent.current = Tone.Transport.scheduleRepeat(
            (time) => {
                Tone.Draw.schedule(() => {
                    setCountDown((current) => current - 1);
                }, time);
            },
            "4n",
            "0:1:0"
        );
        setCountDown(4);
        Tone.Transport.start();
        changeEvent.current = Tone.Transport.scheduleOnce(() => {
            countInPart.current.dispose();
            if (repeatEvent.current) Tone.Transport.clear(repeatEvent.current);
            setCountDown(0);
            stop();
            setIsRollPlaying(true);
            play(
                selectedSong.notes,
                selectedSong.bpm,
                rollTimeToToneTime(selectedSong.gridParams.width)
            );
        }, "1m");
    };

    const handleRecordClick = () => {
        if (!isRecording) {
            setIsRecording(true);
            handleRecord();
        } else {
            setIsRecording(false);
        }
    };

    const getRecordIcon = () => {
        if (countDown > 0) {
            return countDown;
        }
        if (isRecording) {
            return <BsRecord />;
        }
        return <BsRecordFill />;
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
            <Button
                id="record-button"
                className={`col-span-1 flex items-center justify-center text-6xl ${
                    isRecording ? "bg-warn" : ""
                }`}
                onClick={handleRecordClick}
            >
                {getRecordIcon()}
            </Button>
            <Metronome disabled={props.disabled} />
            <BPMInput
                id="bpm-input"
                value={selectedSong.bpm}
                onChange={(value: number) => changeBPM(value)}
                increment={5}
                min={30}
                max={250}
                disabled={isRollPlaying || props.disabled}
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
