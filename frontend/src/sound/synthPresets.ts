import { IconType } from "react-icons";
import { TbWaveSawTool, TbWaveSine } from "react-icons/tb";
import { GiXylophone, GiGuitar } from "react-icons/gi";
import { FaGuitar } from "react-icons/fa";
import * as Tone from "tone";

export interface SynthPreset {
    name: string;
    icon: IconType;
    preset: Tone.Synth | Tone.PolySynth | Tone.Sampler;
    filter?: Tone.Filter;
}

export const SYNTH_PRESETS: SynthPreset[] = [
    {
        name: "Xylophone",
        icon: GiXylophone,
        preset: new Tone.PolySynth(Tone.FMSynth, {
            harmonicity: 8,
            modulationIndex: 2,
            oscillator: {
                type: "sine",
            },
            envelope: {
                attack: 0.001,
                decay: 2,
                sustain: 0.1,
                release: 2,
            },
            modulation: {
                type: "square",
            },
            modulationEnvelope: {
                attack: 0.002,
                decay: 0.2,
                sustain: 0,
                release: 0.2,
            },
        }),
    },
    {
        name: "Electric guitar",
        icon: GiGuitar,
        preset: new Tone.Sampler({
            urls: {
                C3: "/samples/electric_guitar_C3.mp3",
            },
            release: 1,
        }),
    },
    {
        name: "Acoustic guitar",
        icon: FaGuitar,
        preset: new Tone.Sampler({
            urls: {
                C4: "/samples/acoustic_guitar_C4.mp3",
            },
            release: 1,
        }),
    },
    {
        name: "Basic sawtooth",
        icon: TbWaveSawTool,
        preset: new Tone.PolySynth(Tone.Synth, {
            envelope: {
                attack: 0.005,
                attackCurve: "linear",
                decay: 0.1,
                decayCurve: "exponential",
                release: 1,
                releaseCurve: "exponential",
                sustain: 0.3,
            },
            oscillator: {
                partialCount: 0,
                phase: 0,
                type: "sawtooth",
            },
        }),
        filter: new Tone.Filter(400, "lowpass"),
    },
    {
        name: "Basic sine",
        icon: TbWaveSine,
        preset: new Tone.PolySynth(Tone.Synth, {
            envelope: {
                attack: 0.005,
                attackCurve: "linear",
                decay: 0.1,
                decayCurve: "exponential",
                release: 1,
                releaseCurve: "exponential",
                sustain: 0.3,
            },
            oscillator: {
                partialCount: 0,
                phase: 0,
                type: "sine",
            },
        }),
    },
];
