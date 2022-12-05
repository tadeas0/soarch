import { DetailedHTMLProps, FunctionComponent } from "react";
import * as React from "react";

type ButtonProps = { pressed?: boolean } & DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
>;

const Button: FunctionComponent<ButtonProps> = (props) => {
    const { className, pressed, ...other } = props;
    const activeClasses = props.disabled
        ? "bg-light-primary text-white text-opacity-60"
        : "bg-light-primary text-white hover:text-black hover:bg-medium-primary";
    const colorClass = pressed ? "bg-medium-primary" : activeClasses;
    return (
        <button
            type="button"
            className={`rounded border-medium-primary p-2 ${colorClass} ${props.className}`}
            {...other}
        >
            {props.children}
        </button>
    );
};

Button.defaultProps = {
    pressed: false,
};

export default Button;
