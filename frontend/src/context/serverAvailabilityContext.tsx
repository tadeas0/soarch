import React, { useState, FunctionComponent } from "react";

interface AvailabilityState {
    isServerAvailable: boolean;
    setServerAvailable: (a: boolean) => void;
}

const contextDefaultValues: AvailabilityState = {
    isServerAvailable: false,
    setServerAvailable: (a: boolean) => {},
};

export const AvailabilityContext = React.createContext(contextDefaultValues);

export const AvailabilityProvider: FunctionComponent = ({ children }) => {
    const [isServerAvailable, setServerAvailable] = useState(false);

    return (
        <AvailabilityContext.Provider
            value={{
                isServerAvailable,
                setServerAvailable,
            }}
        >
            {children}
        </AvailabilityContext.Provider>
    );
};
