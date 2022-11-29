export const MIDI_NOTES = 128;
export const DEFAULT_PIANO_ROLL_HEIGHT = 73;
export const DEFAULT_PIANO_ROLL_WIDTH = 64;
export const MIN_MEASURES = 4;
export const MIN_BPM = 30;
export const MAX_BPM = 250;
export const MAX_POLYPHONY = 16;
export const DEFAULT_BPM = 120;
export const PIANO_ROLL_LOWEST_NOTE = "C1";
export const PIANO_ROLL_NOTE_SUBDIVISION = 16; // Must be from [2, 4, 8, 16]
export const MEASURE_LENGTH = 16;
export const NOTES = ["C", "D", "E", "F", "G", "A", "B"];
export const PIANO_ROLL_NOTE_HEIGHT = 20;
export const PIANO_ROLL_NOTE_WIDTH = 20;
export const DEFAULT_NOTE_LENGTH = 2;
export const PIANO_ROLL_HANDLE_PART = 1 / 2; // part of the note, that is considered handle

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

export const BACKGROUND = "#f2e8cfff";
export const LIGHT_PRIMARY = "#477998ff";
export const LIGHT_PRIMARY_LOW_OPACITY = "#4779984f";
export const MEDIUM_PRIMARY = "#9c7a97ff";
export const MEDIUM_PRIMARY_LOW_OPACITY = "#9c7a974f";
export const DARK_PRIMARY = "#1e152aff";
export const DARK_PRIMARY_LOW_OPACITY = "#1e152a4f";
export const WARN = "#b24c63ff";
export const WHITE = "#e5e5db";
export const BLACK = "#2e3436";

export const BG_COLOR = "#f2e8cfff";
export const MEDIUM_BG_COLOR = "#1f2833";
export const LIGHT_BG_COLOR = "#c5c6c7";
export const SECONDARY_COLOR = "#45a29e";
export const PRIMARY_COLOR = "#477998ff";

export const NOTE_HIGHLIGHT_COLOR = WHITE;
export const PIANO_ROLL_GRID_COLORS = [BLACK, BLACK, BLACK];
export const PIANO_ROLL_BLACK_KEY_COLOR = MEDIUM_PRIMARY_LOW_OPACITY;
export const PIANO_ROLL_BG_COLOR = WHITE;
export const PIANO_ROLL_PLAYHEAD_COLOR = LIGHT_PRIMARY;
export const PIANO_ROLL_NOTE_COLOR = LIGHT_PRIMARY;
export const PIANO_ROLL_NOTE_OUTLINE_COLOR = DARK_PRIMARY_LOW_OPACITY;
export const HIDE_STRATEGIES = true;
export const MIN_NOTES_FOR_FETCHING = 3;
export const MAX_OCTAVE_OFFSET = 2;
export const ON_SCREEN_PIANO_LOW = "C4";
export const ON_SCREEN_PIANO_HIGH = "C5";
export const MAX_TABS = 10;
