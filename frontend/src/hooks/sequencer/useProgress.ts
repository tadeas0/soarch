import { useContext, useEffect, useState } from "react";
import { SequencerContext } from "../../context/sequencerContext";

const useProgress = (isPlaying: boolean): number => {
    const [localProgress, setLocalProgress] = useState(0);
    const { progress } = useContext(SequencerContext);

    useEffect(() => {
        const interval = setInterval(() => {
            setLocalProgress(isPlaying ? progress.current : 0);
        }, 100);

        return () => clearInterval(interval);
    }, [progress, isPlaying]);

    return localProgress;
};

export default useProgress;
