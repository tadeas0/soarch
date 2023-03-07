import { NoteSerialized } from "./NoteSerialized";

export interface SearchResultResponse {
    artist: string;
    name: string;
    notes: NoteSerialized[];
    bpm: number;
    similarity: number;
}
