import GridParams from "./GridParams";
import { Note } from "./Note";

export interface SongParams {
    name: string;
    bpm: number;
    notes: Note[];
    gridParams: GridParams;
}
