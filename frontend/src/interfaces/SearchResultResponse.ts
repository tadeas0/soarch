import { NoteSerialized } from "./NoteSerialized";

export interface SearchResultResponse {
    artist: string;
    name: string;
    notes: NoteSerialized[];
    bpm: number;
    similarity: number;
    preview_url: string | null;
    spotify_url: string | null;
}
