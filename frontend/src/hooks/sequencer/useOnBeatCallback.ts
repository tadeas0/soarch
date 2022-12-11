import { useEffect } from "react";
import * as Tone from "tone";

const useOnBeatCallback = (callback: (time: number) => void) => {
    useEffect(() => {
        const id = Tone.Transport.scheduleRepeat((time) => {
            Tone.Draw.schedule(() => {
                callback(Tone.Transport.seconds);
            }, time);
        }, "16n");
        return () => {
            Tone.Transport.clear(id);
        };
    }, [callback]);
};

export default useOnBeatCallback;
