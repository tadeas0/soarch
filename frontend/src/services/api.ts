import axios, { AxiosRequestConfig } from "axios";
import { SimilarityStrategy } from "../interfaces/SimilarityStrategy";
import { Song } from "../interfaces/Song";
import { NoteForm } from "../interfaces/NoteForm";
import { JobResponse } from "../interfaces/JobResponse";

export default {
    postNotes(
        noteForm: NoteForm,
        config: AxiosRequestConfig<any> | undefined = undefined
    ) {
        return axios.post<JobResponse>("/api/midi", noteForm, config);
    },
    getResult(
        jobId: string,
        config: AxiosRequestConfig<any> | undefined = undefined
    ) {
        return axios.get<JobResponse>(`/api/midi/${jobId}`, config);
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
