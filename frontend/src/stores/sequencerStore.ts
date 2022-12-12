import create from "zustand";

interface SequenceState {
    isPlaying: boolean;
    setIsPlaying: (value: boolean) => void;
}

const useSequencerStore = create<SequenceState>()((set) => ({
    isPlaying: false,
    setIsPlaying: (value: boolean) => set(() => ({ isPlaying: value })),
}));

export default useSequencerStore;
