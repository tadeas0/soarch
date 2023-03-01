import * as Tone from "tone";

export interface GridParamsSerialized {
    width: number;
    height: number;
    lowestNote: Tone.Unit.MidiNote;
}
