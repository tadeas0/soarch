import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SettingsState {
    volume: number;
    useFasterSearch: boolean;
    notePlayback: boolean;
    useCountIn: boolean;
    setUseCountIn: (val: boolean) => void;
    setVolume: (val: number) => void;
    setUseFasterSearch: (val: boolean) => void;
    setNotePlayback: (val: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            volume: 0.5,
            useFasterSearch: true,
            notePlayback: true,
            useCountIn: true,
            setNotePlayback: (val: boolean) =>
                set(() => ({ notePlayback: val })),
            setVolume: (val: number) => set(() => ({ volume: val })),
            setUseFasterSearch: (val: boolean) =>
                set(() => ({ useFasterSearch: val })),
            setUseCountIn: (val: boolean) => set(() => ({ useCountIn: val })),
        }),
        {
            name: "settings",
        }
    )
);
