import { create } from "zustand";
import { SearchResult } from "../interfaces/SearchResult";
import { SimilarityStrategy } from "../interfaces/SimilarityStrategy";

export interface SearchResultState {
    searchResults: SearchResult[];
    isLoading: boolean;
    selectedStrategy: SimilarityStrategy;
    jobId: string | null;
    setJobId: (id: string | null) => void;
    setSearchResults: (results: SearchResult[]) => void;
    setIsLoading: (val: boolean) => void;
}

export const useSearchResultStore = create<SearchResultState>((set) => ({
    searchResults: [],
    isLoading: false,
    selectedStrategy: {
        name: "Local alignment (Biopython lib)",
        shortcut: "lcabp",
    },
    jobId: null,
    setJobId: (id: string | null) => set(() => ({ jobId: id })),
    setSearchResults: (results: SearchResult[]) =>
        set(() => ({ searchResults: results })),
    setIsLoading: (val: boolean) => set(() => ({ isLoading: val })),
}));
