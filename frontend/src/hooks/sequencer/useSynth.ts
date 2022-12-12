import { useContext } from "react";
import * as Tone from "tone";
import { getSynthFromPreset } from "../../common/common";
import { SequencerContext } from "../../context/sequencerContext";
import { SynthPreset } from "../../sound/synthPresets";
import { SequencerSynth } from "../../types/sequencerSynth";

const useSynth = () => {
    const { synthRef } = useContext(SequencerContext);

    const setSynth = (newSynth: SequencerSynth) => {
        synthRef.current = newSynth;
    };

    const setSynthFromPreset = (preset: SynthPreset) => {
        setSynth(getSynthFromPreset(preset));
    };

    const triggerAttack = (pitch: Tone.FrequencyClass) => {
        synthRef.current.triggerAttack(
            pitch.toNote(),
            Tone.context.currentTime
        );
    };

    const triggerRelease = (pitch: Tone.FrequencyClass) => {
        synthRef.current.triggerRelease(
            pitch.toNote(),
            Tone.context.currentTime
        );
    };

    const triggerAttackRelease = (
        pitch: Tone.FrequencyClass,
        length: Tone.TimeClass = Tone.Time("16n")
    ) => {
        synthRef.current.triggerAttackRelease(
            pitch.toNote(),
            length.toSeconds()
        );
    };

    return {
        synth: synthRef.current,
        triggerAttack,
        triggerRelease,
        triggerAttackRelease,
        setSynth,
        setSynthFromPreset,
    };
};

export default useSynth;
