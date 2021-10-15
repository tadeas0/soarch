import * as React from "react";
import { useState } from "react";
import * as Tone from "tone";

const usePlayback = (): [boolean, () => void] => {
    const [isPlaying, setPlaying] = useState(
        Tone.Transport.state === "started"
    );

    const handleToggle = () => {
        const ctx = new Tone.Context();
        if (ctx.state === "suspended") {
            Tone.start();
        }

        if (Tone.Transport.state === "started") {
            Tone.Transport.stop();
            console.log("stop");
            setPlaying(false);
        } else if (Tone.Transport.state === "stopped") {
            Tone.Transport.start();
            setPlaying(true);
        }
    };
    return [isPlaying, handleToggle];
};

export default usePlayback;
