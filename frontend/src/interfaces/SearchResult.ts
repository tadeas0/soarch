import { Note } from "./Note";

export interface SearchResult {
    artist: string;
    name: string;
    notes: Note[];
    bpm: number;
    similarity: number;
    previewUrl: string | null;
    spotifyUrl: string | null;
}
