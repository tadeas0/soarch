import { NoteSerialized } from "./NoteSerialized";

export interface NoteForm {
    notes: NoteSerialized[];
    similarityStrategy?: string;
    useFasterSearch?: boolean;
    gridLength: number;
}
