import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SettingsState {
    volume: number;
    useFasterSearch: boolean;
    setVolume: (val: number) => void;
    setUseFasterSearch: (val: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            volume: 0.5,
            useFasterSearch: true,
            setVolume: (val: number) => set(() => ({ volume: val })),
            setUseFasterSearch: (val: boolean) =>
                set(() => ({ useFasterSearch: val })),
        }),
        {
            name: "settings",
        }
    )
);
