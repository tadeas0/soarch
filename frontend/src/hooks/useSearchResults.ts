import { useState } from "react";
import { useMutation, useQuery } from "react-query";
import { deserializeNote, serializeNote } from "../common/common";
import { MIN_NOTES_FOR_FETCHING } from "../constants";
import GridParams from "../interfaces/GridParams";
import { Note } from "../interfaces/Note";
import { NoteForm } from "../interfaces/NoteForm";
import api from "../services/api";
import { useSearchResultStore } from "../stores/searchResultStore";

const REFETCH_INTERVAL = 1500;

const useSearchResults = () => {
    const [jobId, setJobId] = useState<string | null>(null);
    const {
        searchResults,
        setSearchResults,
        isLoading,
        setIsLoading,
        selectedStrategy,
    } = useSearchResultStore();

    const { data } = useQuery(
        [jobId],
        async () => {
            if (jobId === null) return null;
            const res = await api.getResult(jobId);
            if (res.data.status === "completed") {
                setJobId(null);
            }
            return res.data;
        },
        {
            enabled: jobId !== null,
            refetchInterval: REFETCH_INTERVAL,
            onSuccess: (queryData) => {
                if (queryData?.status === "completed" && queryData.results) {
                    const results = queryData.results.map((r) => ({
                        ...r,
                        notes: r.notes.map(deserializeNote),
                    }));
                    setSearchResults(results);
                    setIsLoading(false);
                }
            },
        }
    );

    const { mutate } = useMutation(
        async (notes: NoteForm) => {
            if (jobId !== null) return null;
            if (notes.notes.length < MIN_NOTES_FOR_FETCHING) {
                setSearchResults([]);
                return null;
            }
            const query = {
                ...notes,
                similarityStrategy: selectedStrategy.shortcut,
            };
            return api.postNotes(query);
        },
        {
            onSuccess: async (mutData) => {
                if (mutData !== null) {
                    setJobId(mutData.data.id);
                    setIsLoading(true);
                }
            },
        }
    );

    const handleMutate = (song: { notes: Note[]; gridParams: GridParams }) => {
        mutate({
            gridLength: song.gridParams.width,
            notes: song.notes.map(serializeNote),
        });
    };

    return {
        searchResults,
        jobStatus: data?.status,
        isLoading,
        mutate: handleMutate,
    };
};

export default useSearchResults;
