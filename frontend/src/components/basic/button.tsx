import { DetailedHTMLProps, FunctionComponent } from "react";

type ButtonProps = { pressed?: boolean } & DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
>;

const Button: FunctionComponent<ButtonProps> = (props) => {
    const { className, ...other } = props;
    const colorClass = props.pressed
        ? "bg-medium-primary"
        : "bg-light-primary text-white hover:text-black hover:bg-medium-primary";
    return (
        <button
            className={`rounded border-medium-primary p-2 ${colorClass} ${props.className}`}
            {...other}
        >
            {props.children}
        </button>
    );
};

export default Button;
