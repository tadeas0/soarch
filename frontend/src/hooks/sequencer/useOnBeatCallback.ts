import { useEffect } from "react";
import * as Tone from "tone";

const useOnTimeCallback = (
    callback: (time: number) => void,
    interval: Tone.Unit.Time
) => {
    useEffect(() => {
        const loop = new Tone.Loop((time) => {
            Tone.Draw.schedule(() => {
                callback(Tone.Transport.seconds);
            }, time);
        }, interval).start(0);
        return () => {
            loop.dispose();
        };
    }, [callback, interval]);
};

const useOnBeatCallback = (callback: (time: number) => void) =>
    useOnTimeCallback(callback, "16n");

export { useOnTimeCallback };
export default useOnBeatCallback;
