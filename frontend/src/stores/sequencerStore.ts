import { create } from "zustand";

export interface SequencerState {
    sequencerIds: string[];
    playingId: string | null;
    setPlayingId: (id: string | null) => void;
    setSequencerIds: (ids: string[]) => void;
    addSequencerId: (id: string) => void;
    removeSequencerId: (id: string) => void;
}

export const useSequencerStore = create<SequencerState>((set) => ({
    sequencerIds: [],
    playingId: null,
    setPlayingId: (id: string | null) => set(() => ({ playingId: id })),
    setSequencerIds: (ids: string[]) => set(() => ({ sequencerIds: ids })),
    addSequencerId: (id: string) =>
        set((state) => ({ sequencerIds: [...state.sequencerIds, id] })),
    removeSequencerId: (id: string) =>
        set((state) => ({
            playingId: state.playingId === id ? null : state.playingId,
            sequencerIds: state.sequencerIds.filter((s) => s !== id),
        })),
}));
