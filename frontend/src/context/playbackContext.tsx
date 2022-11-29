import React, { useState, FunctionComponent } from "react";

interface PlaybackContextState {
    isPlaying: boolean;
    setPlaying: (a: boolean) => void;
}

const contextDefaultValues: PlaybackContextState = {
    isPlaying: false,
    setPlaying: () => {},
};

export const PlaybackContext = React.createContext(contextDefaultValues);

export const PlaybackProvider: FunctionComponent = ({ children }) => {
    const [isPlaying, setPlaying] = useState(false);

    return (
        <PlaybackContext.Provider
            value={{
                isPlaying,
                setPlaying,
            }}
        >
            {children}
        </PlaybackContext.Provider>
    );
};
