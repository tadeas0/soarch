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
    KeyZ: "C4",
    KeyS: "C#4",
    KeyX: "D4",
    KeyD: "D#4",
    KeyC: "E4",
    KeyV: "F4",
    KeyG: "F#4",
    KeyB: "G4",
    KeyH: "G#4",
    KeyN: "A4",
    KeyJ: "A#4",
    KeyM: "B4",

    KeyQ: "C5",
    Digit2: "C#5",
    KeyW: "D5",
    Digit3: "D#5",
    KeyE: "E5",
    KeyR: "F5",
    Digit5: "F#5",
    KeyT: "G5",
    Digit6: "G#5",
    KeyY: "A5",
    Digit7: "A#5",
    KeyU: "B5",
    KeyI: "C6",
};
