import axios, { AxiosRequestConfig } from "axios";
import { SimilarityStrategy } from "../interfaces/SimilarityStrategy";
import { SearchResultResponse } from "../interfaces/SearchResultResponse";
import { Song } from "../interfaces/Song";
import { NoteForm } from "../interfaces/NoteForm";

export default {
    postNotes(
        noteForm: NoteForm,
        config: AxiosRequestConfig<any> | undefined = undefined
    ) {
        return axios.post<SearchResultResponse>("/api/midi", noteForm, config);
    },
    getSimilarityStrategies(
        config: AxiosRequestConfig<any> | undefined = undefined
    ) {
        return axios.get<SimilarityStrategy[]>(
            "/api/similarity-strategy",
            config
        );
    },
    getExampleQueries(config: AxiosRequestConfig<any> | undefined = undefined) {
        return axios.get<Song[]>("/api/example-queries", config);
    },
    getHealthCheck(config: AxiosRequestConfig<any> | undefined = undefined) {
        return axios.get("/api/healthcheck", config);
    },
};
