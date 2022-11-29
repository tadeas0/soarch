import { FunctionComponent } from "react";
import { Link, LinkProps } from "react-router-dom";
import * as React from "react";

type LinkButtonProps = LinkProps;

const LinkButton: FunctionComponent<LinkButtonProps> = (props) => {
    const { className, ...other } = props;
    return (
        <Link
            {...other}
            className={`rounded bg-light-primary text-white hover:bg-medium-primary hover:text-black ${className}`}
        />
    );
};

export default LinkButton;
