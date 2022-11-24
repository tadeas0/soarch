export const MIDI_NOTES = 128;
export const DEFAULT_PIANO_ROLL_HEIGHT = 36;
export const DEFAULT_PIANO_ROLL_WIDTH = 64;
export const MIN_BPM = 30;
export const MAX_BPM = 250;
export const DEFAULT_BPM = 120;
export const PIANO_ROLL_LOWEST_NOTE = "C3";
export const PIANO_ROLL_NOTE_SUBDIVISION = 16; // Must be from [2, 4, 8, 16]
export const MEASURE_LENGTH = 16;
export const NOTES = ["C", "D", "E", "F", "G", "A", "B"];
export const PIANO_ROLL_NOTE_HEIGHT = 20;
export const PIANO_ROLL_NOTE_WIDTH = 20;
export const DEFAULT_NOTE_LENGTH = 2;
export const PIANO_ROLL_HEADER_SIZE = 20;

export const KEYBOARD_NOTE_MAP: { [keyCode: string]: number } = {
    KeyZ: 0,
    KeyS: 1,
    KeyX: 2,
    KeyD: 3,
    KeyC: 4,
    KeyV: 5,
    KeyG: 6,
    KeyB: 7,
    KeyH: 8,
    KeyN: 9,
    KeyJ: 10,
    KeyM: 11,

    KeyQ: 12,
    Digit2: 13,
    KeyW: 14,
    Digit3: 15,
    KeyE: 16,
    KeyR: 17,
    Digit5: 18,
    KeyT: 19,
    Digit6: 20,
    KeyY: 21,
    Digit7: 22,
    KeyU: 23,
};

export const BG_COLOR = "#0b0c10";
export const MEDIUM_BG_COLOR = "#1f2833";
export const LIGHT_BG_COLOR = "#c5c6c7";
export const SECONDARY_COLOR = "#45a29e";
export const PRIMARY_COLOR = "#66fcf1";
export const NOTE_HIGHLIGHT_COLOR = "#ffffff";

export const PIANO_ROLL_GRID_COLORS = ["gray", "gray", SECONDARY_COLOR];
export const PIANO_ROLL_BLACK_KEY_COLOR = BG_COLOR;
export const PIANO_ROLL_BG_COLOR = MEDIUM_BG_COLOR;
export const PIANO_ROLL_PLAYHEAD_COLOR = SECONDARY_COLOR;
export const HIDE_STRATEGIES = true;
export const MIN_NOTES_FOR_FETCHING = 3;
