import { FunctionComponent } from "react";
import { Link } from "react-router-dom";

const TopLogo: FunctionComponent = () => {
    return (
        <Link to="/">
            <img
                src="/logo_text.svg"
                className="absolute top-0 left-0 h-16"
                alt="soarch logo"
            />
        </Link>
    );
};

export default TopLogo;
