import GridParams from "./GridParams";
import { Note } from "../sound/sequencer";

export interface SongParams {
    name: string;
    bpm: number;
    notes: Note[];
    gridParams: GridParams;
}
