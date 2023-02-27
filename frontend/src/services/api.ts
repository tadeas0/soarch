import * as Tone from "tone";
import axios, { AxiosRequestConfig } from "axios";

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

export interface GridParamsSerialized {
    width: number;
    height: number;
    lowestNote: Tone.Unit.MidiNote;
}

export interface Song {
    artist: string;
    name: string;
    notes: NoteSerialized[];
    bpm: number;
    gridParams?: GridParamsSerialized;
    similarity: number;
}

export interface SearchResultResponse {
    tracks: Song[];
}

export interface SimilarityStrategy {
    name: string;
    shortcut: string;
}

export const API = {
    postNotes(
        noteForm: NoteForm,
        config: AxiosRequestConfig<any> | undefined = undefined
    ) {
        return axios.post<SearchResultResponse>("/api/midi", noteForm, config);
    },
    getSimilarityStrategies(
        config: AxiosRequestConfig<any> | undefined = undefined
    ) {
        return axios.get<SimilarityStrategy[]>(
            "/api/similarity-strategy",
            config
        );
    },
    getExampleQueries(config: AxiosRequestConfig<any> | undefined = undefined) {
        return axios.get<Song[]>("/api/example-queries", config);
    },
    getHealthCheck(config: AxiosRequestConfig<any> | undefined = undefined) {
        return axios.get("/api/healthcheck", config);
    },
};
