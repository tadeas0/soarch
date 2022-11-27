import * as React from "react";
import { FunctionComponent } from "react";

export interface Option {
    name: string;
    value: string;
}

interface StrategySelectorProps {
    options: Option[];
    selectedValue?: Option;
    onChange: (newValue: Option) => void;
}

const StrategySelector: FunctionComponent<StrategySelectorProps> = (props) => {
    return (
        <select
            className="strategy-selector"
            onChange={(e) =>
                props.onChange({ name: e.target.name, value: e.target.value })
            }
        >
            {props.options.map((o) => (
                <option value={o.value} key={o.value}>
                    {o.name}
                </option>
            ))}
        </select>
    );
};

export default StrategySelector;
