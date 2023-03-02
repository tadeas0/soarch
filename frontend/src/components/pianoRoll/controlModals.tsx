import { FunctionComponent } from "react";
import * as React from "react";
import { FullScreenHandle } from "react-full-screen";
import FullscreenModal from "./fullscreenModal";
import LandscapeModal from "./landscapeModal";

interface ControlModalsProps {
    fullscreenHandle: FullScreenHandle;
}

const ControlModals: FunctionComponent<ControlModalsProps> = (props) =>
    !props.fullscreenHandle.active ? (
        <FullscreenModal fullscreenHandle={props.fullscreenHandle} />
    ) : (
        <LandscapeModal />
    );

export default ControlModals;
