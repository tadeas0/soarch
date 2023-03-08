import * as Tone from "tone";

export default interface GridParams {
    width: number;
    height: number;
    lowestNote: Tone.Unit.Note;
}
