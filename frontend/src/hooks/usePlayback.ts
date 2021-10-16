import { useEffect, useState } from "react";
import Sequencer from "../sequencer";

const usePlayback = (): [boolean, () => void] => {
    const [isPlaying, setIsPlaying] = useState(false);

    const handleToggle = () => {
        if (!Sequencer.isInitialized()) {
            Sequencer.init();
        }

        if (Sequencer.isPlaying()) {
            Sequencer.stop();
            setIsPlaying(false);
        } else {
            Sequencer.start();
            setIsPlaying(true);
        }
    };

    useEffect(() => {
        setIsPlaying(Sequencer.isPlaying());
    }, []);

    return [isPlaying, handleToggle];
};

export default usePlayback;
