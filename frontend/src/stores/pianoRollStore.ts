import create from "zustand";
import { SongParams } from "../interfaces/SongParams";
import {
    DEFAULT_BPM,
    DEFAULT_PIANO_ROLL_HEIGHT,
    DEFAULT_PIANO_ROLL_WIDTH,
    MAX_TABS,
    MEASURE_LENGTH,
    MIN_MEASURES,
    PIANO_ROLL_LOWEST_NOTE,
    UNDO_STACK_SIZE,
} from "../constants";
import { Note } from "../interfaces/Note";
import { toneTimeToRollTime } from "../common/coordConversion";

export interface PianoRollState {
    songs: SongParams[];
    selectedIndex: number;
    playbackEnabled: boolean;
    hasChanged: boolean;
    isPianoHidden: boolean;
    undoStack: Note[][];
    isRecording: boolean;
    setIsRecording: (value: boolean) => void;
    saveState: (notes: Note[]) => void;
    undo: () => void;
    addNote: (note: Note) => void;
    deleteNote: (note: Note) => void;
    setNotes: (notes: Note[]) => void;
    clear: () => void;
    setPlaybackEnabled: (value: boolean) => void;
    changeBPM: (value: number) => void;
    addTab: (value?: SongParams) => void;
    removeTab: (value: number) => void;
    selectTab: (value: number) => void;
    addMeasure: () => void;
    removeMeasure: () => void;
    clearChangeFlag: () => void;
    setIsPianoHidden: (value: boolean) => void;
}

const getTabName = (existingNames: string[], newName: string) => {
    let i = 1;
    let targetName = newName;
    while (true) {
        const index = existingNames.indexOf(targetName);
        if (index === -1) return targetName;
        targetName = `${newName} (${i})`;
        i++;
    }
};

const canAddTab = (existingTabs: SongParams[]) =>
    existingTabs.length <= MAX_TABS;

export const DEFAULT_SONG_PARAMS: SongParams = {
    bpm: DEFAULT_BPM,
    gridParams: {
        height: DEFAULT_PIANO_ROLL_HEIGHT,
        width: DEFAULT_PIANO_ROLL_WIDTH,
        lowestNote: PIANO_ROLL_LOWEST_NOTE,
    },
    name: "Song",
    notes: [],
};

export const usePianoRollStore = create<PianoRollState>((set) => ({
    songs: [{ ...DEFAULT_SONG_PARAMS }],
    selectedIndex: 0,
    playbackEnabled: true,
    hasChanged: false,
    isPianoHidden: true,
    undoStack: [],
    isRecording: false,

    setIsRecording: (value: boolean) =>
        set(() => ({
            isRecording: value,
        })),

    saveState: (notes: Note[]) =>
        set((state) => {
            const newStack = [...state.undoStack];
            if (state.undoStack.length >= UNDO_STACK_SIZE) {
                newStack.shift();
            }
            newStack.push(notes);
            return { undoStack: newStack };
        }),

    undo: () =>
        set((state) => {
            const undoStack = [...state.undoStack];
            const lastState = undoStack.pop();
            if (lastState) {
                const newSongs = [...state.songs];
                newSongs[state.selectedIndex].notes = lastState;
                return { songs: newSongs, hasChanged: true, undoStack };
            }
            return { hasChanged: true, undoStack };
        }),

    addNote: async (note: Note) =>
        set((state) => {
            const newSongs = [...state.songs];
            const oldNotes = newSongs[state.selectedIndex].notes;
            newSongs[state.selectedIndex].notes = [...oldNotes, note];
            return { songs: newSongs, hasChanged: true };
        }),

    deleteNote: async (note: Note) =>
        set((state) => {
            const newSongs = [...state.songs];
            const oldNotes = newSongs[state.selectedIndex].notes;
            newSongs[state.selectedIndex].notes = oldNotes.filter(
                (n) => n !== note
            );
            return { songs: newSongs, hasChanged: true };
        }),

    setNotes: async (notes: Note[]) =>
        set((state) => {
            const newSongs = [...state.songs];
            newSongs[state.selectedIndex].notes = notes;
            return { songs: newSongs, hasChanged: true };
        }),

    clear: () =>
        set((state) => {
            const newSongs = [...state.songs];
            const newStack = [
                ...state.undoStack,
                newSongs[state.selectedIndex].notes,
            ];
            newSongs[state.selectedIndex].notes = [];
            return {
                songs: newSongs,
                hasChanged: true,
                undoStack: newStack,
            };
        }),

    setPlaybackEnabled: (value: boolean) =>
        set(() => ({ playbackEnabled: value })),

    changeBPM: (value: number) =>
        set((state) => {
            const newSongs = [...state.songs];
            newSongs[state.selectedIndex].bpm = value;
            return { songs: newSongs };
        }),

    addTab: (value: SongParams = { ...DEFAULT_SONG_PARAMS }) =>
        set((state) => {
            if (!canAddTab(state.songs)) return {};
            const newSong = value;
            const newName = getTabName(
                state.songs.map((s) => s.name),
                newSong.name
            );
            newSong.name = newName;
            return {
                songs: [...state.songs, newSong],
                selectedIndex: state.songs.length,
                hasChanged: true,
                undoStack: [],
            };
        }),

    removeTab: (value: number) =>
        set((state) => {
            if (
                value >= 0 &&
                value < state.songs.length &&
                state.songs.length > 1
            ) {
                const newSongs = state.songs.filter((_, i) => i !== value);
                let newSelected = state.selectedIndex;
                let newStack = [...state.undoStack];
                if (newSelected >= newSongs.length - 1) {
                    newSelected = newSongs.length - 1;
                }
                if (value === state.selectedIndex) {
                    newStack = [];
                }
                return {
                    songs: newSongs,
                    selectedIndex: newSelected,
                    undoStack: newStack,
                    hasChanged: true,
                };
            }
            if (value === 0 && state.songs.length === 1) {
                return {
                    songs: [{ ...DEFAULT_SONG_PARAMS }],
                    selectedIndex: 0,
                    hasChanged: true,
                };
            }
            return {};
        }),

    selectTab: (value: number) =>
        set((state) => {
            if (value >= 0 && value < state.songs.length)
                return {
                    selectedIndex: value,
                    hasChanged: true,
                    undoStack: [],
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
            return { songs: newSongs };
        });
    },

    removeMeasure: () =>
        set((state) => {
            const newSongs = [...state.songs];
            const selSong = newSongs[state.selectedIndex];
            const canRemove =
                selSong.gridParams.width > MIN_MEASURES * MEASURE_LENGTH;
            if (!canRemove) return {};
            const newGridLength = selSong.gridParams.width - MEASURE_LENGTH;
            const newNotes = selSong.notes.filter(
                (n) =>
                    toneTimeToRollTime(n.time) + toneTimeToRollTime(n.length) <
                    newGridLength
            );
            newSongs[state.selectedIndex].gridParams.width = newGridLength;
            newSongs[state.selectedIndex].notes = newNotes;
            return { songs: newSongs };
        }),

    clearChangeFlag: async () =>
        set(() => ({
            hasChanged: false,
        })),

    setIsPianoHidden: (value: boolean) => set(() => ({ isPianoHidden: value })),
}));

export const useSelectedSong = () =>
    usePianoRollStore((state) => state.songs[state.selectedIndex]);

export const useTabControls = () =>
    usePianoRollStore((state) => ({
        canAddTab: canAddTab(state.songs),
        selectTab: state.selectTab,
        addTab: state.addTab,
        removeTab: state.removeTab,
    }));
