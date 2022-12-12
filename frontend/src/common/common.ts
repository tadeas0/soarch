import { MAX_POLYPHONY } from "../constants";
import { SynthPreset } from "../sound/synthPresets";
import * as Tone from "tone";

export const clamp = (n: number, min: number, max: number) =>
    Math.min(Math.max(n, min), max);

export const getSynthFromPreset = (preset: SynthPreset) => {
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
