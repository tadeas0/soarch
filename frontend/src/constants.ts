import assert from "assert";

export const MIDI_NOTES = 128;
export const DEFAULT_PIANO_ROLL_HEIGHT = 24;
export const DEFAULT_PIANO_ROLL_WIDTH = 50;
export const PIANO_ROLL_LOWEST_NOTE = "C3";
export const PIANO_ROLL_NOTE_SUBDIVISION = 16; // Must be [2, 4, 8, 16]
assert(PIANO_ROLL_NOTE_SUBDIVISION % 16 === 0);
export const NOTES = ["C", "D", "E", "F", "G", "A", "B"];
