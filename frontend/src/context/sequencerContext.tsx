import React, {
    createRef,
    FunctionComponent,
    useRef,
    MutableRefObject,
} from "react";
import * as Tone from "tone";

const partRef = createRef<Tone.Part<any> | null>();
export const SequencerContext =
    React.createContext<MutableRefObject<Tone.Part<any> | null>>(partRef);

export const SequencerContextProvider: FunctionComponent = ({ children }) => {
    const part = useRef<Tone.Part | null>(new Tone.Part());

    return (
        <SequencerContext.Provider value={part}>
            {children}
        </SequencerContext.Provider>
    );
};
