import { useEffect, useState } from "react";
import { Sequencer } from "../sequencer";

const usePlayback = (): [
    boolean,
    (noteGrid: boolean[][]) => void,
    () => void
] => {
    const [isPlaying, setIsPlaying] = useState(false);

    const handleStart = async (noteGrid: boolean[][]) => {
        if (!Sequencer.isInitialized()) {
            await Sequencer.init();
        }
        Sequencer.stop();
        Sequencer.clearBuffer();
        Sequencer.addGridToBuffer(noteGrid);
        Sequencer.start();
        setIsPlaying(true);
    };

    const handleStop = async () => {
        Sequencer.stop();
        Sequencer.clearBuffer();
        setIsPlaying(false);
    };

    useEffect(() => {
        setIsPlaying(Sequencer.isPlaying());
    }, []);

    return [isPlaying, handleStart, handleStop];
};

export default usePlayback;
