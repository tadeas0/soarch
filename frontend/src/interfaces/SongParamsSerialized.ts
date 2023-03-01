import { GridParamsSerialized } from "./GridParamsSerialized";
import { NoteSerialized } from "./NoteSerialized";

export interface SongParamsSerialized {
    name: string;
    bpm: number;
    notes: NoteSerialized[];
    gridParams: GridParamsSerialized;
}
