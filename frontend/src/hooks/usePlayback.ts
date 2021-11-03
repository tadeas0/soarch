import { useContext, useEffect } from "react";
import { PlaybackContext } from "../context/playbackContext";
import { Sequencer } from "../sequencer";

const usePlayback = (): [
    boolean,
    (noteGrid: boolean[][]) => void,
    () => void
] => {
    const { isPlaying, setPlaying } = useContext(PlaybackContext);

    const handleStart = async (noteGrid: boolean[][]) => {
        if (!Sequencer.isInitialized()) {
            await Sequencer.init();
        }
        Sequencer.stop();
        Sequencer.clearBuffer();
        Sequencer.addGridToBuffer(noteGrid);
        Sequencer.start();
        setPlaying(true);
    };

    const handleStop = async () => {
        Sequencer.stop();
        Sequencer.clearBuffer();
        setPlaying(false);
    };

    useEffect(() => {
        setPlaying(Sequencer.isPlaying());
    }, [setPlaying]);

    return [isPlaying, handleStart, handleStop];
};

export default usePlayback;
