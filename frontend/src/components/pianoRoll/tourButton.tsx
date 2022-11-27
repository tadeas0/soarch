import { FunctionComponent, useContext } from "react";
import { IoMdHelp } from "react-icons/io";
import { ShepherdTourContext } from "react-shepherd";

const TourButton: FunctionComponent = () => {
    const tour = useContext(ShepherdTourContext);

    return (
        <button
            onClick={() => tour?.start()}
            id="tour-button"
            className="absolute bottom-0 right-0 rounded-tl bg-light-primary p-2 text-xl text-white hover:bg-medium-primary hover:text-black"
        >
            <IoMdHelp />
        </button>
    );
};

export default TourButton;
