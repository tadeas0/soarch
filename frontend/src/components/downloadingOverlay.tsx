import { FunctionComponent, useState } from "react";
import { PulseLoader } from "react-spinners";
import { PRIMARY_COLOR } from "../constants";
import * as React from "react";
import useOnBeatCallback from "../hooks/sequencer/useOnBeatCallback";
import { usePianoRollStore } from "../stores/pianoRollStore";
import { rollTimeToToneTime } from "../common/coordConversion";

interface DownloadingOverlayProps {}

const DownloadingOverlay: FunctionComponent<DownloadingOverlayProps> = () => {
    const [progress, setProgress] = useState(0);
    const [index, songs] = usePianoRollStore((state) => [
        state.selectedIndex,
        state.songs,
    ]);
    const selectedSong = songs[index];

    useOnBeatCallback((time) => {
        const songLen = rollTimeToToneTime(
            selectedSong.gridParams.width
        ).toSeconds();
        setProgress(Math.round((time / songLen) * 100));
    });

    return (
        <div className="absolute top-0 bottom-0 left-0 right-0 z-10 flex items-center justify-center bg-black bg-opacity-70">
            <div className="flex flex-col items-center justify-center">
                <PulseLoader size={35} color={PRIMARY_COLOR} />
                <h2 className="mt-4 text-2xl font-semibold text-white">
                    Exporting your song...
                </h2>
                <h2 className="mt-4 text-2xl font-semibold text-white">
                    {progress}%
                </h2>
            </div>
        </div>
    );
};

export default DownloadingOverlay;
