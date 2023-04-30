import { FunctionComponent } from "react";
import { BsPauseFill, BsSpotify } from "react-icons/bs";
import * as React from "react";
import usePlayer from "../../hooks/usePlayer";

const SpotifyPlayer: FunctionComponent<{
    previewUrl: string | null;
    className?: string;
    disabled?: boolean;
}> = ({ previewUrl, className, disabled }) => {
    const { isPlaying, start, stop } = usePlayer(previewUrl);
    return (
        <button
            type="button"
            className={`${className} ${previewUrl ? "" : "invisible"}`}
            onClick={() => (isPlaying ? stop() : start())}
            disabled={disabled}
        >
            {isPlaying ? (
                <BsPauseFill />
            ) : (
                <BsSpotify opacity={disabled ? 0.6 : 1} />
            )}
        </button>
    );
};

SpotifyPlayer.defaultProps = {
    className: "",
    disabled: false,
};

export default SpotifyPlayer;
