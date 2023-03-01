import * as Tone from "tone";

export interface NoteSerialized {
    pitch: Tone.Unit.MidiNote;
    length: Tone.Unit.Time;
    time: Tone.Unit.Time;
}
