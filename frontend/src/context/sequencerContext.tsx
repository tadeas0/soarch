import React, { FunctionComponent, useRef, MutableRefObject } from "react";
import * as Tone from "tone";
import { getSynthFromPreset } from "../common/common";
import { SYNTH_PRESETS } from "../sound/synthPresets";
import { SequencerSynth } from "../types/sequencerSynth";

interface SequencerContextState {
    synthRef: MutableRefObject<SequencerSynth>;
    partRef: MutableRefObject<Tone.Part>;
    progress: MutableRefObject<number>;
}

export const SequencerContext = React.createContext<SequencerContextState>(
    {} as SequencerContextState
);

export const SequencerContextProvider: FunctionComponent = ({ children }) => {
    const part = useRef<Tone.Part>(new Tone.Part());
    const synth = useRef<SequencerSynth>(getSynthFromPreset(SYNTH_PRESETS[0]));
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
                progress,
            }}
        >
            {children}
        </SequencerContext.Provider>
    );
};
