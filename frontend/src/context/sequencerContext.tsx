import React, {
    createRef,
    FunctionComponent,
    useRef,
    MutableRefObject,
} from "react";
import * as Tone from "tone";
import { getSynthFromPreset } from "../common/common";
import { SYNTH_PRESETS } from "../sound/synthPresets";
import { SequencerSynth } from "../types/sequencerSynth";

const partRef = createRef<Tone.Part<any>>() as MutableRefObject<Tone.Part>;
const synthRef =
    createRef<SequencerSynth>() as MutableRefObject<SequencerSynth>;

interface SequencerContextState {
    synthRef: MutableRefObject<SequencerSynth>;
    partRef: MutableRefObject<Tone.Part>;
}

export const SequencerContext = React.createContext<SequencerContextState>({
    partRef,
    synthRef,
});

export const SequencerContextProvider: FunctionComponent = ({ children }) => {
    const part = useRef<Tone.Part>(new Tone.Part());
    const synth = useRef<SequencerSynth>(getSynthFromPreset(SYNTH_PRESETS[0]));

    return (
        <SequencerContext.Provider value={{ partRef: part, synthRef: synth }}>
            {children}
        </SequencerContext.Provider>
    );
};
