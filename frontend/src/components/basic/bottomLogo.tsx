import { FunctionComponent } from "react";
import { Link } from "react-router-dom";
import * as React from "react";

const BottomLogo: FunctionComponent = () => (
    <Link to="/">
        <img
            src="/logo_text.svg"
            className="absolute bottom-4 left-0 h-16"
            alt="soarch logo"
        />
    </Link>
);

export default BottomLogo;
