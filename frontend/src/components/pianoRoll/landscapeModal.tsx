import { FunctionComponent } from "react";
import * as React from "react";
import useIsLandscape from "../../hooks/useIsLandscape";
import useIsXlScreen from "../../hooks/useIsXlScreen";
import { AiOutlineRotateRight } from "react-icons/ai";

interface LandscapeModalProps {}

const LandscapeModal: FunctionComponent<LandscapeModalProps> = () => {
    const isLandscape = useIsLandscape();
    const isXl = useIsXlScreen();
    const visible = !isXl && !isLandscape;

    return (
        <div
            className={`absolute top-0 left-0 right-0 z-10 flex h-screen flex-col items-center justify-center bg-black bg-opacity-70 p-6 text-white ${
                visible ? "block" : "hidden"
            }`}
        >
            <AiOutlineRotateRight size={80} />
            <h1 className="text-xl text-white">Please rotate your device</h1>
        </div>
    );
};

export default LandscapeModal;
