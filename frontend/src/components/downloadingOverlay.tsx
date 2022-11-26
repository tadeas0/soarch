import { FunctionComponent } from "react";
import { PulseLoader } from "react-spinners";
import { PRIMARY_COLOR } from "../constants";

interface DownloadingOverlayProps {}

const DownloadingOverlay: FunctionComponent<DownloadingOverlayProps> = () => {
    return (
        <div className="overlay">
            <div className="overlay-inner-container">
                <div className="overlay-spinner">
                    <PulseLoader size="35" color={PRIMARY_COLOR} />
                </div>
                <h2>Exporting your song...</h2>
            </div>
        </div>
    );
};

export default DownloadingOverlay;
