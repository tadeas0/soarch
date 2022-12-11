import create, { StateCreator } from "zustand";
import * as Tone from "tone";
import { SynthPreset, SYNTH_PRESETS } from "../sound/synthPresets";
import { MAX_POLYPHONY } from "../constants";
import { Note } from "../sound/sequencer";

const getSynthFromPreset = (preset: SynthPreset) => {
    let newSynth = preset.preset;
    if (newSynth instanceof Tone.PolySynth) {
        newSynth.maxPolyphony = MAX_POLYPHONY;
    }
    if (preset.filter !== undefined) {
        const newFilter = preset.filter;
        newSynth = newSynth.connect(newFilter);
        newFilter.toDestination();
    } else {
        newSynth.toDestination();
    }
    return newSynth;
};

type SequencerSynth = Tone.PolySynth | Tone.Synth | Tone.Sampler;

interface SequenceSlice {
    isPlaying: boolean;
    notes: Note[];
    setIsPlaying: (value: boolean) => void;
}

interface SynthSlice {
    synth: SequencerSynth;
    setSynth: (synth: SequencerSynth) => void;
    setSynthFromPreset: (preset: SynthPreset) => void;
}

const createSequenceSlice: StateCreator<
    SequenceSlice & SynthSlice,
    [],
    [],
    SequenceSlice
> = (set) => ({
    isPlaying: false,
    setIsPlaying: (value: boolean) => set(() => ({ isPlaying: value })),
});

const createSynthSlice: StateCreator<
    SequenceSlice & SynthSlice,
    [],
    [],
    SynthSlice
> = (set) => ({
    synth: getSynthFromPreset(SYNTH_PRESETS[0]),
    setSynth: (synth: SequencerSynth) => set(() => ({ synth })),
    setSynthFromPreset: (preset: SynthPreset) =>
        set(() => ({ synth: getSynthFromPreset(preset) })),
});

const useSequencerStore = create<SequenceSlice & SynthSlice>()((...a) => ({
    ...createSequenceSlice(...a),
    ...createSynthSlice(...a),
}));

export default useSequencerStore;
