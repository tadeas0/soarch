import { FunctionComponent } from "react";
import { BsPauseFill, BsSpotify } from "react-icons/bs";
import * as React from "react";
import usePlayer from "../../hooks/usePlayer";

const SpotifyPlayer: FunctionComponent<{
    previewUrl: string | null;
    className?: string;
}> = ({ previewUrl, className }) => {
    const { isPlaying, start, stop } = usePlayer(previewUrl);
    return (
        <button
            type="button"
            className={`${className} ${previewUrl ? "" : "invisible"}`}
            onClick={() => (isPlaying ? stop() : start())}
        >
            {isPlaying ? <BsPauseFill /> : <BsSpotify />}
        </button>
    );
};

SpotifyPlayer.defaultProps = {
    className: "",
};

export default SpotifyPlayer;
