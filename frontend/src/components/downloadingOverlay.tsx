import { FunctionComponent } from "react";
import { PulseLoader } from "react-spinners";
import { PRIMARY_COLOR } from "../constants";
import * as React from "react";

interface DownloadingOverlayProps {}

const DownloadingOverlay: FunctionComponent<DownloadingOverlayProps> = () => (
    <div className="absolute top-0 bottom-0 left-0 right-0 z-10 flex items-center justify-center bg-black bg-opacity-70">
        <div className="flex flex-col items-center justify-center">
            <PulseLoader size={35} color={PRIMARY_COLOR} />
            <h2 className="mt-4 text-2xl font-semibold text-white">
                Exporting your song...
            </h2>
        </div>
    </div>
);

export default DownloadingOverlay;
