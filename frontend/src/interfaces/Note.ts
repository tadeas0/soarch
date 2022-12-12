import * as Tone from "tone";

export interface Note {
    time: Tone.TimeClass;
    pitch: Tone.FrequencyClass;
    length: Tone.TimeClass;
}
