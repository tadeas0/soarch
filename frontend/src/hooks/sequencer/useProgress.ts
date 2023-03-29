import { useContext, useEffect, useState } from "react";
import { SequencerContext } from "../../context/sequencerContext";
import { Sequencer } from "./useSequencer";

const useProgress = (sequencer: Sequencer): number => {
    const [localProgress, setLocalProgress] = useState(0);
    const { progress } = useContext(SequencerContext);

    useEffect(() => {
        const interval = setInterval(() => {
            setLocalProgress(sequencer.isPlaying ? progress.current : 0);
        }, 100);

        return () => clearInterval(interval);
    }, [progress, sequencer.isPlaying]);

    return localProgress;
};

export default useProgress;
