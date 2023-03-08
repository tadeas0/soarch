import * as React from "react";
import { FunctionComponent } from "react";

interface TooltipProps {
    text: string;
}

const Tooltip: FunctionComponent<TooltipProps> = (props) => (
    <span className="group/tooltip relative">
        {props.children}
        <span className="pointer-events-none absolute left-1/2 w-52 -translate-x-1/2 rounded-md bg-black/90 p-2 text-sm text-white opacity-0 transition-opacity group-hover/tooltip:opacity-100">
            {props.text}
        </span>
    </span>
);

export default Tooltip;
