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

export interface Song {
    artist: string;
    name: string;
    notes: NoteSerialized[];
    bpm: number;
}

export interface SearchResultResponse {
    tracks: Song[];
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
    getExampleQueries() {
        return axios.get<Song[]>("/api/example-queries");
    },
};
