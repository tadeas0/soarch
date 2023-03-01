import { FunctionComponent } from "react";
import * as React from "react";
import Button from "../basic/button";
import { FullScreenHandle } from "react-full-screen";

interface FullscreenModalProps {
    fullscreenHandle: FullScreenHandle;
}

const FullscreenModal: FunctionComponent<FullscreenModalProps> = (props) => (
    <div className="absolute top-0 left-0 right-0 z-10 flex h-screen items-center justify-center bg-black bg-opacity-70 p-6">
        <div className="flex flex-col items-center justify-center gap-4 rounded-md bg-background p-6">
            <h1 className="text-xl">
                The application only works in fullscreen. Please click the
                following button to enable it.
            </h1>
            <Button onClick={props.fullscreenHandle.enter}>
                Enable fullscreen
            </Button>
        </div>
    </div>
);

export default FullscreenModal;
