import { useContext, useEffect } from "react";
import { PlaybackContext } from "../context/playbackContext";
import { Sequencer, Note } from "../sequencer";

const usePlayback = (): [
    boolean,
    (notes: Note[], gridLength: number) => void,
    () => void
] => {
    const { isPlaying, setPlaying } = useContext(PlaybackContext);

    const handleStart = async (notes: Note[], gridLength: number) => {
        if (!Sequencer.isInitialized()) {
            await Sequencer.init();
        }
        Sequencer.stop();
        Sequencer.clearBuffer();
        Sequencer.addNotesToBuffer(notes, gridLength);
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
