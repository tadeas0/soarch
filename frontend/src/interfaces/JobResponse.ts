import { SearchResultResponse } from "./SearchResultResponse";

export interface JobResponse {
    id: string;
    status: "pending" | "completed";
    results: SearchResultResponse[] | null;
}
