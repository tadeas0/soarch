import { FunctionComponent, useContext } from "react";
import { IoMdHelp } from "react-icons/io";
import { ShepherdTourContext } from "react-shepherd";
import * as React from "react";

const TourButton: FunctionComponent = () => {
    const tour = useContext(ShepherdTourContext);

    return (
        <button
            onClick={() => tour?.start()}
            id="tour-button"
            type="button"
            className="fixed bottom-0 right-0 hidden rounded-tl bg-light-primary p-2 text-xl text-white hover:bg-medium-primary hover:text-black xl:block"
        >
            <IoMdHelp />
        </button>
    );
};

export default TourButton;
