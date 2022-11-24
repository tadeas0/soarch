import create from "zustand";
import { SongParams } from "../components/pianoRoll/songTabs";
import {
    DEFAULT_BPM,
    DEFAULT_PIANO_ROLL_HEIGHT,
    DEFAULT_PIANO_ROLL_WIDTH,
    MEASURE_LENGTH,
    PIANO_ROLL_LOWEST_NOTE,
} from "../constants";
import { Note, Sequencer } from "../sound/sequencer";

export interface PianoRollState {
    songs: SongParams[];
    selectedIndex: number;
    isResultPlaying: boolean;
    isRollPlaying: boolean;
    playbackEnabled: boolean;
    hasChanged: boolean;
    setIsRollPlaying: (value: boolean) => void;
    setIsResultPlaying: (value: boolean) => void;
    addNote: (note: Note) => void;
    deleteNote: (note: Note) => void;
    clear: () => void;
    setPlaybackEnabled: (value: boolean) => void;
    changeBPM: (value: number) => void;
    addTab: (value?: SongParams) => void;
    removeTab: (value: number) => void;
    selectTab: (value: number) => void;
    addMeasure: () => void;
    removeMeasure: () => void;
    clearChangeFlag: () => void;
}

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

export const usePianoRollStore = create<PianoRollState>((set, get) => ({
    songs: [{ ...DEFAULT_SONG_PARAMS }],
    selectedIndex: 0,
    isResultPlaying: false,
    isRollPlaying: false,
    playbackEnabled: false,
    hasChanged: false,
    setIsRollPlaying: (value: boolean) =>
        set((state) => ({ isRollPlaying: value, isResultPlaying: false })),

    setIsResultPlaying: (value: boolean) =>
        set((state) => ({ isResultPlaying: value, isRollPlaying: false })),

    addNote: (note: Note) =>
        set((state) => {
            Sequencer.addNoteToBuffer(note);
            const newSongs = [...state.songs];
            const oldNotes = newSongs[state.selectedIndex].notes;
            newSongs[state.selectedIndex].notes = [...oldNotes, note];
            return { songs: newSongs, hasChanged: true };
        }),

    deleteNote: (note: Note) =>
        set((state) => {
            Sequencer.deleteNoteFromBuffer(note);
            const newSongs = [...state.songs];
            const oldNotes = newSongs[state.selectedIndex].notes;
            newSongs[state.selectedIndex].notes = oldNotes.filter(
                (n) => n !== note
            );
            return { songs: newSongs, hasChanged: true };
        }),

    clear: () =>
        set((state) => {
            const newSongs = [...state.songs];
            newSongs[state.selectedIndex].notes = [];
            return {
                songs: newSongs,
                isRollPlaying: false,
                isResultPlaying: false,
            };
        }),

    setPlaybackEnabled: (value: boolean) =>
        set((state) => ({ playbackEnabled: value })),

    changeBPM: (value: number) =>
        set((state) => {
            const newSongs = [...state.songs];
            newSongs[state.selectedIndex].bpm = value;
            return { songs: newSongs };
        }),

    addTab: (value?: SongParams) =>
        set((state) => {
            let newSong = value;
            if (newSong === undefined) {
                newSong = {
                    ...DEFAULT_SONG_PARAMS,
                    name: "Song " + (state.songs.length + 1),
                };
            }
            return {
                songs: [...state.songs, newSong],
                selectedIndex: state.songs.length,
                isRollPlaying: false,
                isResultPlaying: false,
            };
        }),

    removeTab: (value: number) =>
        set((state) => {
            if (
                value > 0 &&
                value < state.songs.length &&
                state.songs.length > 1
            ) {
                const newSongs = state.songs.filter((_, i) => i !== value);
                let newSelected = state.selectedIndex;
                if (newSelected >= newSongs.length - 1) {
                    newSelected = newSongs.length - 1;
                }
                return {
                    songs: newSongs,
                    selectedIndex: newSelected,
                    isRollPlaying: false,
                    isResultPlaying: false,
                };
            }
            return {};
        }),

    selectTab: (value: number) =>
        set((state) => {
            if (value >= 0 && value < state.songs.length)
                return {
                    selectedIndex: value,
                    isRollPlaying: false,
                    isResultPlaying: false,
                };
            return {};
        }),

    addMeasure: () => {
        set((state) => {
            const newSongs = [...state.songs];
            const selSong = newSongs[state.selectedIndex];
            const oldGp = newSongs[state.selectedIndex].gridParams;
            selSong.gridParams = {
                ...oldGp,
                width: oldGp.width + MEASURE_LENGTH,
            };
            return { songs: newSongs, isRollPlaying: false };
        });
    },

    removeMeasure: () =>
        set((state) => {
            const newSongs = [...state.songs];
            const selSong = newSongs[state.selectedIndex];
            const canRemove = selSong.gridParams.width > 2 * MEASURE_LENGTH;
            if (!canRemove) return {};
            const newGridLength = selSong.gridParams.width - MEASURE_LENGTH;
            const newNotes = selSong.notes.filter(
                (n) =>
                    Sequencer.toneTimeToRollTime(n.time) +
                        Sequencer.toneTimeToRollTime(n.length) <
                    newGridLength
            );
            newSongs[state.selectedIndex].gridParams.width = newGridLength;
            newSongs[state.selectedIndex].notes = newNotes;
            return { songs: newSongs, isRollPlaying: false };
        }),

    clearChangeFlag: () =>
        set((state) => ({
            hasChanged: false,
        })),
}));

export const useSelectedSong = () => {
    return usePianoRollStore((state) => state.songs[state.selectedIndex]);
};
