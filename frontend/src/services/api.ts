import * as Tone from "tone";
import axios from "axios";

interface NoteForm {
    notes: NoteSerialized[];
    gridLength: number;
}

interface NoteSerialized {
    pitch: Tone.Unit.MidiNote;
    length: Tone.Unit.Time;
    time: Tone.Unit.Time;
}

export const API = {
    postNotes(noteForm: NoteForm) {
        return axios.post("/api/midi", noteForm);
    },
};
