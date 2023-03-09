import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";

const usePlayer = (url: string | null) => {
    const player = useRef<Tone.Player>();
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (url) {
            player.current = new Tone.Player(url).toDestination();
            player.current.onstop = () => {
                setIsPlaying(false);
            };
        }

        return () => {
            player.current?.dispose();
        };
    }, [url]);

    const start = () => {
        player.current?.start(0);
        setIsPlaying(true);
    };

    const stop = () => {
        player.current?.stop();
    };

    return { isPlaying, start, stop };
};

export default usePlayer;
