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

interface SearchResultResponse {
    tracks: [
        {
            artist: string;
            name: string;
            notes: [
                {
                    length: string;
                    pitch: number;
                    time: string;
                }
            ];
        }
    ];
}

export const API = {
    postNotes(noteForm: NoteForm) {
        return axios.post<SearchResultResponse>("/api/midi", noteForm);
    },
};
