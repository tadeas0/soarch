import * as Tone from "tone";
import axios from "axios";

export interface NoteForm {
    notes: NoteSerialized[];
    similarityStrategy?: string;
    gridLength: number;
}

export interface NoteSerialized {
    pitch: Tone.Unit.MidiNote;
    length: Tone.Unit.Time;
    time: Tone.Unit.Time;
}

export interface SearchResultResponse {
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
            bpm: number;
        }
    ];
}

export interface SimilarityStrategy {
    name: string;
    shortcut: string;
}

export const API = {
    postNotes(noteForm: NoteForm) {
        return axios.post<SearchResultResponse>("/api/midi", noteForm);
    },
    getSimilarityStrategies() {
        return axios.get<SimilarityStrategy[]>("/api/similarity-strategy");
    },
};
