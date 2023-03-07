import { create } from "zustand";

export interface SettingsState {
    volume: number;
    useFasterSearch: boolean;
    setVolume: (val: number) => void;
    setUseFasterSearch: (val: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
    volume: 0.5,
    useFasterSearch: true,
    setVolume: (val: number) => set(() => ({ volume: val })),
    setUseFasterSearch: (val: boolean) => set(() => ({ useFasterSearch: val })),
}));
