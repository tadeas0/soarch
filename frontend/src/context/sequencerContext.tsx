import React, {
    FunctionComponent,
    useRef,
    MutableRefObject,
    useState,
} from "react";
import * as Tone from "tone";
import { getSynthFromPreset } from "../common/common";
import { SYNTH_PRESETS } from "../sound/synthPresets";
import { SequencerSynth } from "../types/sequencerSynth";

interface SequencerContextState {
    synthRef: MutableRefObject<SequencerSynth>;
    partRef: MutableRefObject<Tone.Part>;
    progress: MutableRefObject<number>;
    sequencerIds: string[];
    setSequencerIds: React.Dispatch<React.SetStateAction<string[]>>;
    playingId: string | null;
    setPlayingId: React.Dispatch<React.SetStateAction<string | null>>;
}

export const SequencerContext = React.createContext<SequencerContextState>(
    {} as SequencerContextState
);

export const SequencerContextProvider: FunctionComponent = ({ children }) => {
    const part = useRef<Tone.Part>(new Tone.Part());
    const synth = useRef<SequencerSynth>(getSynthFromPreset(SYNTH_PRESETS[0]));
    const [sequencerIds, setSequencerIds] = useState<string[]>([]);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const progress = useRef(0);

    useRef(
        new Tone.Loop((time) => {
            Tone.Draw.schedule(() => {
                progress.current = part.current.progress;
            }, time);
        }, "16n").start(0)
    );

    return (
        <SequencerContext.Provider
            value={{
                partRef: part,
                synthRef: synth,
                sequencerIds,
                playingId,
                progress,
                setSequencerIds,
                setPlayingId,
            }}
        >
            {children}
        </SequencerContext.Provider>
    );
};
