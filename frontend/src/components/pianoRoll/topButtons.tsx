/* eslint-disable @typescript-eslint/no-use-before-define */
import {
    BsPauseFill,
    BsFillPlayFill,
    BsRecord,
    BsRecordFill,
} from "react-icons/bs";
import { CgPiano } from "react-icons/cg";
import { MIN_BPM, MAX_BPM } from "../../constants";
import InstrumentSelector from "./instrumentSelector";
import BPMInput from "./bpmInput";
import Metronome from "./metronome";
import { usePianoRollStore } from "../../stores/pianoRollStore";
import Button from "../basic/button";
import * as React from "react";
import { Sequencer } from "../../hooks/sequencer/useSequencer";
import { rollTimeToToneTime } from "../../common/coordConversion";
import * as Tone from "tone";
import { useEffect, useRef, useState } from "react";
import useKeyboardListener from "../../hooks/useKeyboardListener";
import useSearchResults from "../../hooks/useSearchResults";

const defaultProps = {
    disabled: false,
};

type TopButtonsProps = {
    rollSequencer: Sequencer;
    disabled?: boolean;
} & typeof defaultProps;

type PlaybackState = "Stopped" | "Playing" | "Recording" | "Countdown";

const TopButtons = (props: TopButtonsProps) => {
    const [songs, selectedIndex] = usePianoRollStore((state) => [
        state.songs,
        state.selectedIndex,
    ]);
    const changeBPM = usePianoRollStore((state) => state.changeBPM);
    const { mutate } = useSearchResults();
    const [isPianoHidden, isRecording, setIsPianoHidden, setIsRecording] =
        usePianoRollStore((state) => [
            state.isPianoHidden,
            state.isRecording,
            state.setIsPianoHidden,
            state.setIsRecording,
        ]);
    const [countDown, setCountDown] = useState(0);
    const countInPart = useRef(new Tone.Part());
    const repeatEvent = useRef(new Tone.Loop());
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

    const playbackState = useRef<PlaybackState>("Stopped");

    const recordWithCountdown = () => {
        const metronomeNotes = [];
        for (let i = 0; i < 4; i++) {
            const pitch = i % 4 === 0 ? "G4" : "C4";
            metronomeNotes.push({ time: `0:${i}:0`, pitch });
        }
        countInPart.current = new Tone.Part((time, note) => {
            metronomeSampler.current!.triggerAttackRelease(
                note.pitch,
                "0:0:1",
                time
            );
        }, metronomeNotes)
            .start(0)
            .stop("1:0:0");
        setCountDown(4);
        repeatEvent.current = new Tone.Loop((time) => {
            Tone.Draw.schedule(() => {
                setCountDown((current) => current - 1);
            }, time);
        })
            .start("0:1:0")
            .stop("1:1:0");
        props.rollSequencer.play(
            selectedSong.notes,
            selectedSong.bpm,
            rollTimeToToneTime(selectedSong.gridParams.width),
            false,
            Tone.Time("1m")
        );
        setIsRecording(true);
    };

    const handlePlayClick = async () => {
        switch (playbackState.current) {
            case "Stopped":
                props.rollSequencer.play(
                    selectedSong.notes,
                    selectedSong.bpm,
                    rollTimeToToneTime(selectedSong.gridParams.width)
                );
                playbackState.current = "Playing";
                break;
            case "Playing":
                props.rollSequencer.stop();
                playbackState.current = "Stopped";
                break;
            case "Recording":
                props.rollSequencer.stop();
                setIsRecording(false);
                mutate(selectedSong);
                playbackState.current = "Stopped";
                break;
            case "Countdown":
                if (countDown === 0) {
                    playbackState.current = "Recording";
                    handlePlayClick();
                }
                break;
            default:
                throw new Error("Unknown state");
        }
    };

    const handleRecordClick = async () => {
        switch (playbackState.current) {
            case "Stopped":
                recordWithCountdown();
                playbackState.current = "Countdown";
                break;
            case "Playing":
                setIsRecording(true);
                playbackState.current = "Recording";
                break;
            case "Recording":
                setIsRecording(false);
                mutate(selectedSong);
                playbackState.current = "Playing";
                break;
            case "Countdown":
                if (countDown === 0) {
                    playbackState.current = "Recording";
                    handleRecordClick();
                }
                break;
            default:
                throw new Error("Unknown state");
        }
    };

    const getPlayIcon = () => {
        if (props.disabled) return <BsFillPlayFill />;
        if (props.rollSequencer.isPlaying) return <BsPauseFill />;
        return <BsFillPlayFill />;
    };

    const disposeParts = () => {
        if (!countInPart.current.disposed) countInPart.current.dispose();
        if (!repeatEvent.current.disposed) repeatEvent.current.dispose();
    };

    useEffect(() => {
        const event = props.rollSequencer.addOnStop(() => {
            if (
                playbackState.current === "Recording" ||
                playbackState.current === "Countdown"
            ) {
                disposeParts();
                mutate(selectedSong);
                setIsRecording(false);
                playbackState.current = "Stopped";
            }
        });

        return () => props.rollSequencer.clearOnStop(event);
    }, [mutate, props.rollSequencer, selectedSong, setIsRecording]);

    const getRecordIcon = () => {
        if (countDown > 0) {
            return countDown;
        }
        if (isRecording) {
            return <BsRecord />;
        }
        return <BsRecordFill />;
    };

    const handleKeyboardDown = (e: KeyboardEvent) => {
        if (e.key === " " && countDown === 0) {
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
                    ) ||
                    props.disabled ||
                    countDown > 0
                }
            >
                {getPlayIcon()}
            </Button>
            <Button
                id="record-button"
                className={`col-span-1 flex items-center justify-center text-4xl xl:text-6xl ${
                    isRecording ? "bg-warn" : ""
                }`}
                onClick={handleRecordClick}
            >
                {getRecordIcon()}
            </Button>
            <BPMInput
                id="bpm-input"
                value={selectedSong.bpm}
                onChange={(value: number) => changeBPM(value)}
                increment={5}
                min={30}
                max={250}
                disabled={props.rollSequencer.isPlaying || props.disabled}
            />
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
