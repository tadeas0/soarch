import { Note } from "../sound/sequencer";

export interface SearchResult {
    artist: string;
    name: string;
    notes: Note[];
    bpm: number;
}
