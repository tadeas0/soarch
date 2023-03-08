import { FunctionComponent } from "react";
import * as React from "react";

interface CheckboxProps {
    value: boolean;
    onChange: () => void;
    className?: string;
}

const Checkbox: FunctionComponent<CheckboxProps> = (props) => (
    <label
        className={`group flex flex-row items-center rounded-tr-md p-2 hover:bg-medium-primary hover:text-black ${props.className}`}
    >
        <input
            type="checkbox"
            checked={props.value}
            onChange={props.onChange}
            className="mr-4 rounded bg-white text-medium-primary focus:ring-0 focus:ring-offset-0 group-hover:text-dark-primary"
        />
        {props.children}
    </label>
);

Checkbox.defaultProps = {
    className: "",
};

export default Checkbox;
