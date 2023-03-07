import { useMutation, useQuery } from "react-query";
import { deserializeNote, serializeNote } from "../common/common";
import { MIN_NOTES_FOR_FETCHING } from "../constants";
import GridParams from "../interfaces/GridParams";
import { Note } from "../interfaces/Note";
import { NoteForm } from "../interfaces/NoteForm";
import api from "../services/api";
import { useSearchResultStore } from "../stores/searchResultStore";
import { useSettingsStore } from "../stores/settingsStore";

const REFETCH_INTERVAL = 3000;

export interface SongQuery {
    notes: Note[];
    gridParams: GridParams;
}

const useSearchResults = () => {
    const {
        searchResults,
        setSearchResults,
        isLoading,
        setIsLoading,
        selectedStrategy,
        jobId,
        setJobId,
    } = useSearchResultStore();
    const { useFasterSearch } = useSettingsStore();

    const { data } = useQuery(
        [jobId],
        async () => {
            if (jobId === null) return null;
            const res = await api.getResult(jobId);
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
                    setJobId(null);
                }
            },
        }
    );

    const { mutate } = useMutation(
        async (noteForm: NoteForm) => {
            const query = {
                ...noteForm,
                similarityStrategy: selectedStrategy.shortcut,
                useFasterSearch,
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

    const handleMutate = (song: SongQuery, forceUpdate: boolean = false) => {
        if (song.notes.length < MIN_NOTES_FOR_FETCHING) {
            setSearchResults([]);
            setJobId(null);
            setIsLoading(false);
        } else if (jobId === null || forceUpdate) {
            mutate({
                gridLength: song.gridParams.width,
                notes: song.notes.map(serializeNote),
                useFasterSearch,
            });
        }
    };

    return {
        searchResults,
        jobStatus: data?.status,
        isLoading,
        mutate: handleMutate,
    };
};

export default useSearchResults;
