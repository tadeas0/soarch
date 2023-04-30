import * as React from "react";
import { useActor, useInterpret } from "@xstate/react";
import { FunctionComponent, createContext, useContext, useRef } from "react";
import { InterpreterFrom } from "xstate";
import { Sequencer } from "../hooks/sequencer/useSequencer";
import {
    rollTimeToToneTime,
    getGridParamsFromNotes,
} from "../common/coordConversion";
import { useSelectedSong } from "../stores/pianoRollStore";
import * as Tone from "tone";
import { SearchResult } from "../interfaces/SearchResult";
import useSearchResults from "../hooks/useSearchResults";
import playbackMachine from "../stateMachines/playbackMachine";

export const PianorollContext = createContext({
    playbackService: {} as InterpreterFrom<typeof playbackMachine>,
    sequencer: {} as Sequencer,
});
interface PlaybackStateProviderProps {
    searchResult?: SearchResult;
    sequencer: Sequencer;
}

export const PianorollContextProvider: FunctionComponent<
    PlaybackStateProviderProps
> = ({ children, searchResult, sequencer }) => {
    const { mutate } = useSearchResults();
    const { stop, play } = sequencer;
    const countInPart = useRef(new Tone.Part());
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
    const selectedSong = useSelectedSong();

    const playbackService = useInterpret(playbackMachine, {
        services: {
            handleCountIn: () => (cb: any) => {
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
                Tone.Transport.scheduleOnce(() => {
                    countInPart.current.dispose();
                    cb("COUNT_IN_FINISHED");
                }, "1:0:0");
                sequencer.play(
                    selectedSong.notes,
                    selectedSong.bpm,
                    rollTimeToToneTime(selectedSong.gridParams.width),
                    false,
                    Tone.Time("1m")
                );
            },

            scheduleLoopEnd: () => (cb: any) => {
                Tone.Transport.on("loopEnd", () => {
                    cb("STOP");
                });
            },
        },
        actions: {
            handleQueryStart: () => {
                play(
                    selectedSong.notes,
                    selectedSong.bpm,
                    rollTimeToToneTime(selectedSong.gridParams.width),
                    false
                );
            },

            handleResultPlay: () => {
                if (searchResult)
                    play(
                        searchResult.notes,
                        searchResult.bpm,
                        rollTimeToToneTime(
                            getGridParamsFromNotes(searchResult.notes).width
                        ),
                        false
                    );
            },

            handleRecordEnd: () => {
                mutate(selectedSong);
            },

            handleStop: () => {
                stop();
            },
        },
    });

    return (
        <PianorollContext.Provider value={{ playbackService, sequencer }}>
            {children}
        </PianorollContext.Provider>
    );
};

export const usePlaybackMachine = () => {
    const { playbackService } = useContext(PianorollContext);
    return useActor(playbackService);
};

export const useRollSequencer = () => {
    const { sequencer } = useContext(PianorollContext);
    return sequencer;
};

PianorollContextProvider.defaultProps = {
    searchResult: undefined,
};
