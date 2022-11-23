import React, {
    FunctionComponent,
    Dispatch,
    useReducer,
    useContext,
} from "react";
import { SongParams } from "../components/pianoRoll/songTabs";
import {
    DEFAULT_BPM,
    DEFAULT_PIANO_ROLL_HEIGHT,
    DEFAULT_PIANO_ROLL_WIDTH,
    MEASURE_LENGTH,
    PIANO_ROLL_LOWEST_NOTE,
} from "../constants";
import { Note, Sequencer } from "../sound/sequencer";

export const DEFAULT_SONG_PARAMS: SongParams = {
    bpm: DEFAULT_BPM,
    gridParams: {
        height: DEFAULT_PIANO_ROLL_HEIGHT,
        width: DEFAULT_PIANO_ROLL_WIDTH,
        lowestNote: PIANO_ROLL_LOWEST_NOTE,
    },
    name: "Song 1",
    notes: [],
};

export enum PianoRollActionType {
    PLAY_ROLL = "PLAY_ROLL",
    PLAY_RESULT = "PLAY_RESULT",
    TOGGLE_PLAYBACK = "TOGGLE_PLAYBACK",
    ADD_NOTE = "ADD_NOTE",
    DELETE_NOTE = "DELETE_NOTE",
    CLEAR = "CLEAR",
    CHANGE_BPM = "CHANGE_BPM",
    ADD_TAB = "ADD_TAB",
    REMOVE_TAB = "REMOVE_TAB",
    SELECT_TAB = "SELECT_TAB",
    ADD_MEASURE = "ADD_MEASURE",
    REMOVE_MEASURE = "REMOVE_MEASURE",
    CLEAR_HAS_CHANGED_FLAG = "CLEAR_HAS_CHANGED_FLAG",
}

export type PianoRollAction =
    | {
          type:
              | PianoRollActionType.PLAY_ROLL
              | PianoRollActionType.PLAY_RESULT
              | PianoRollActionType.TOGGLE_PLAYBACK
              | PianoRollActionType.ADD_MEASURE
              | PianoRollActionType.REMOVE_MEASURE
              | PianoRollActionType.CLEAR_HAS_CHANGED_FLAG
              | PianoRollActionType.CLEAR;
      }
    | {
          type: PianoRollActionType.ADD_NOTE | PianoRollActionType.DELETE_NOTE;
          payload: Note;
      }
    | { type: PianoRollActionType.CHANGE_BPM; payload: number }
    | { type: PianoRollActionType.ADD_TAB; payload?: SongParams }
    | { type: PianoRollActionType.REMOVE_TAB; payload: number }
    | { type: PianoRollActionType.SELECT_TAB; payload: number };

export interface PianoRollState {
    songs: SongParams[];
    selectedIndex: number;
    isResultPlaying: boolean;
    isRollPlaying: boolean;
    playbackEnabled: boolean;
    hasChanged: boolean;
}

const initialState: PianoRollState = {
    songs: [DEFAULT_SONG_PARAMS],
    selectedIndex: 0,
    isResultPlaying: false,
    isRollPlaying: false,
    playbackEnabled: false,
    hasChanged: false,
};

const rollReducer = (state: PianoRollState, action: PianoRollAction) => {
    const updateSelectedSong = (
        updateFn: (current: SongParams) => SongParams
    ) => {
        const newSongs = [...state.songs];
        const oldSong = newSongs[state.selectedIndex];
        const newSong = updateFn(oldSong);
        newSongs[state.selectedIndex] = newSong;
        return newSongs;
    };

    switch (action.type) {
        case PianoRollActionType.PLAY_ROLL:
            return {
                ...state,
                isResultPlaying: false,
                isRollPlaying: !state.isRollPlaying,
            };
        case PianoRollActionType.PLAY_RESULT:
            return {
                ...state,
                isResultPlaying: !state.isResultPlaying,
                isRollPlaying: false,
            };
        case PianoRollActionType.TOGGLE_PLAYBACK:
            return {
                ...state,
                playbackEnabled: !state.playbackEnabled,
            };
        case PianoRollActionType.CLEAR:
            return {
                ...state,
                isRollPlaying: false,
                songs: updateSelectedSong((current) => ({
                    ...current,
                    notes: [],
                })),
            };
        case PianoRollActionType.ADD_NOTE:
            Sequencer.addNoteToBuffer(action.payload);
            return {
                ...state,
                hasChanged: true,
                songs: updateSelectedSong((current) => ({
                    ...current,
                    notes: [...current.notes, action.payload],
                })),
            };
        case PianoRollActionType.DELETE_NOTE:
            Sequencer.deleteNoteFromBuffer(action.payload);
            return {
                ...state,
                hasChanged: true,
                songs: updateSelectedSong((current) => ({
                    ...current,
                    notes: current.notes.filter((n) => n !== action.payload),
                })),
            };
        case PianoRollActionType.CHANGE_BPM:
            if (!state.isRollPlaying)
                return {
                    ...state,
                    songs: updateSelectedSong((current) => ({
                        ...current,
                        bpm: action.payload,
                    })),
                };
            else return state;
        case PianoRollActionType.ADD_TAB:
            let newSong = action.payload;
            if (newSong === undefined) {
                newSong = {
                    ...DEFAULT_SONG_PARAMS,
                    name: "Song " + (state.songs.length + 1),
                };
            }
            return {
                ...state,
                songs: [...state.songs, newSong],
                selectedIndex: state.songs.length,
            };
        case PianoRollActionType.REMOVE_TAB:
            if (state.songs.length <= 1) return state;
            const newSongs = [...state.songs];
            newSongs.splice(action.payload, 1);
            const newIndex =
                state.selectedIndex >= newSongs.length
                    ? newSongs.length - 1
                    : state.selectedIndex;
            return {
                ...state,
                songs: newSongs,
                selectedIndex: newIndex,
            };
        case PianoRollActionType.SELECT_TAB:
            if (action.payload >= state.songs.length) return state;
            return {
                ...state,
                selectedIndex: action.payload,
            };
        case PianoRollActionType.ADD_MEASURE:
            return {
                ...state,
                songs: updateSelectedSong((current) => ({
                    ...current,
                    gridParams: {
                        ...current.gridParams,
                        width: current.gridParams.width + MEASURE_LENGTH,
                    },
                })),
                isRollPlaying: false,
            };

        case PianoRollActionType.REMOVE_MEASURE:
            const selSong = state.songs[state.selectedIndex];
            const canRemove = selSong.gridParams.width > 2 * MEASURE_LENGTH;
            if (!canRemove) return state;
            const newGridLength = selSong.gridParams.width - MEASURE_LENGTH;
            const newNotes = selSong.notes.filter((n) => {
                return (
                    Sequencer.toneTimeToRollTime(n.time) +
                        Sequencer.toneTimeToRollTime(n.length) <
                    newGridLength
                );
            });
            return {
                ...state,
                songs: updateSelectedSong((current) => ({
                    ...current,
                    gridParams: { ...current.gridParams, width: newGridLength },
                    notes: newNotes,
                })),
                isRollPlaying: false,
            };
        case PianoRollActionType.CLEAR_HAS_CHANGED_FLAG:
            return { ...state, hasChanged: false };
        default:
            return state;
    }
};

const PianoRollDispatchContext = React.createContext<Dispatch<PianoRollAction>>(
    () => {}
);
const PianoRollStateContext = React.createContext(initialState);

export const PianoRollContextProvider: FunctionComponent = ({ children }) => {
    const [state, dispatch] = useReducer(rollReducer, initialState);

    return (
        <PianoRollStateContext.Provider value={state}>
            <PianoRollDispatchContext.Provider value={dispatch}>
                {children}
            </PianoRollDispatchContext.Provider>
        </PianoRollStateContext.Provider>
    );
};

export function usePianoRollDispatch() {
    return useContext(PianoRollDispatchContext);
}

export function usePianoRollState() {
    return useContext(PianoRollStateContext);
}
