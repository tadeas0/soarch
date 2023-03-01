import { GridParamsSerialized } from "./GridParamsSerialized";
import { NoteSerialized } from "./NoteSerialized";

export interface Song {
    artist: string;
    name: string;
    notes: NoteSerialized[];
    bpm: number;
    gridParams?: GridParamsSerialized;
    similarity: number;
}
