import * as Tone from "tone";
import useSequencerStore from "../../stores/sequencerStore";

const useSynth = () => {
    const [synth, setSynth, setSynthFromPreset] = useSequencerStore((state) => [
        state.synth,
        state.setSynth,
        state.setSynthFromPreset,
    ]);

    const triggerAttack = (pitch: Tone.FrequencyClass) => {
        synth.triggerAttack(pitch.toNote(), Tone.context.currentTime);
    };

    const triggerRelease = (pitch: Tone.FrequencyClass) => {
        synth.triggerRelease(pitch.toNote(), Tone.context.currentTime);
    };

    const triggerAttackRelease = (
        pitch: Tone.FrequencyClass,
        length: Tone.TimeClass = Tone.Time("16n")
    ) => {
        synth.triggerAttackRelease(pitch.toNote(), length.toSeconds());
    };

    return {
        synth,
        triggerAttack,
        triggerRelease,
        triggerAttackRelease,
        setSynth,
        setSynthFromPreset,
    };
};

export default useSynth;
