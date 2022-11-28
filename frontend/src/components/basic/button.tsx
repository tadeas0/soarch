import { DetailedHTMLProps, FunctionComponent } from "react";

type ButtonProps = { pressed?: boolean } & DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
>;

const Button: FunctionComponent<ButtonProps> = (props) => {
    const { className, pressed, ...other } = props;
    const colorClass = pressed
        ? "bg-medium-primary"
        : (props.disabled ? "bg-light-primary text-white" : "bg-light-primary text-white hover:text-black hover:bg-medium-primary");
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
