import * as Tone from "tone";

export const MIDI_NOTES = 128;
export const DEFAULT_PIANO_ROLL_HEIGHT = 24;
export const DEFAULT_PIANO_ROLL_WIDTH = 64;
export const PIANO_ROLL_LOWEST_NOTE = "C3";
export const PIANO_ROLL_NOTE_SUBDIVISION = 16; // Must be from [2, 4, 8, 16]
export const MEASURE_LENGTH = 16;
export const NOTES = ["C", "D", "E", "F", "G", "A", "B"];
export const PIANO_ROLL_NOTE_HEIGHT = 20;
export const PIANO_ROLL_NOTE_WIDTH = 20;
export const DEFAULT_NOTE_LENGTH = 4;
export const PIANO_ROLL_HEADER_SIZE = 20;
export const PIANO_ROLL_GRID_COLORS = ["black", "black", "blue"];
export const PIANO_ROLL_BLACK_KEY_COLOR = "gray";
export const PIANO_ROLL_BG_COLOR = "#ffffff";
export const PIANO_ROLL_PLAYHEAD_COLOR = "limegreen";

export const KEYBOARD_NOTE_MAP: { [keyCode: string]: Tone.Unit.Frequency } = {
    KeyZ: "C3",
    KeyS: "C#3",
    KeyX: "D3",
    KeyD: "D#3",
    KeyC: "E3",
    KeyV: "F3",
    KeyG: "F#3",
    KeyB: "G3",
    KeyH: "G#3",
    KeyN: "A3",
    KeyJ: "A#3",
    KeyM: "B3",

    KeyQ: "C4",
    Digit2: "C#4",
    KeyW: "D4",
    Digit3: "D#4",
    KeyE: "E4",
    KeyR: "F4",
    Digit5: "F#4",
    KeyT: "G4",
    Digit6: "G#4",
    KeyY: "A4",
    Digit7: "A#4",
    KeyU: "B4",
};
