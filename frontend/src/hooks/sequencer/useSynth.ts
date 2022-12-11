import * as Tone from "tone";
import useSequencerStore from "../../stores/sequencerStore";

const useSynth = () => {
    const [synth, setSynth, setSynthFromPreset] = useSequencerStore((state) => [
        state.synth,
        state.setSynth,
        state.setSynthFromPreset,
    ]);

    const triggerAttack = (pitch: Tone.Unit.Note) => {
        synth.triggerAttack(pitch);
    };

    const triggerRelease = (pitch: Tone.Unit.Note) => {
        synth.triggerRelease(pitch);
    };

    const triggerAttackRelease = (
        pitch: Tone.Unit.Note,
        length: Tone.Unit.Time = "16n"
    ) => {
        synth.triggerAttackRelease(pitch, length);
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
