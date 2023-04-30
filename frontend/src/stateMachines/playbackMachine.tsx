import { createMachine } from "xstate";

type PlaybackEvents = {
    type:
        | "RECORD"
        | "PLAY_RESULT"
        | "PLAY_QUERY"
        | "COUNT_IN_FINISHED"
        | "STOP";
};

type PlaybackContext = {};

type PlaybackState = {
    value:
        | "stopped"
        | "resultPlaying"
        | "queryPlaying"
        | "recording"
        | "countIn";
    context: PlaybackContext;
};

const playbackMachine = createMachine<
    PlaybackContext,
    PlaybackEvents,
    PlaybackState
>({
    predictableActionArguments: true,
    id: "playbackMachine",
    initial: "stopped",
    invoke: {
        src: "scheduleLoopEnd",
        id: "scheduleLoopEnd",
    },
    states: {
        stopped: {
            on: {
                RECORD: { target: "countIn" },
                PLAY_RESULT: { target: "resultPlaying" },
                PLAY_QUERY: {
                    target: "queryPlaying",
                    actions: "handleQueryStart",
                },
            },
        },
        resultPlaying: {
            on: {
                PLAY_RESULT: { target: "stopped", actions: "handleStop" },
                PLAY_QUERY: {
                    target: "queryPlaying",
                    actions: "handleQueryStart",
                },
                STOP: { target: "stopped", actions: "handleStop" },
            },
            entry: "handleResultPlay",
        },
        queryPlaying: {
            on: {
                RECORD: { target: "recording" },
                PLAY_RESULT: {
                    target: "resultPlaying",
                    actions: "handleResultPlay",
                },
                PLAY_QUERY: { target: "stopped", actions: "handleStop" },
                STOP: { target: "stopped", actions: "handleStop" },
            },
        },
        recording: {
            on: {
                RECORD: { target: "queryPlaying" },
                PLAY_QUERY: { target: "stopped", actions: "handleStop" },
                PLAY_RESULT: { target: "resultPlaying" },
                STOP: { target: "stopped", actions: "handleStop" },
            },
            exit: "handleRecordEnd",
        },
        countIn: {
            invoke: {
                id: "countInService",
                src: "handleCountIn",
            },
            on: {
                COUNT_IN_FINISHED: { target: "recording" },
            },
        },
    },
});

export default playbackMachine;
