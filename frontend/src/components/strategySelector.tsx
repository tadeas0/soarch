import * as React from "react";
import { FunctionComponent } from "react";
import "./strategySelector.css";

interface StrategySelectorProps {
    options: Array<string>;
    selectedValue: string;
    onChange: (newValue: string) => void;
}

const StrategySelector: FunctionComponent<StrategySelectorProps> = (props) => {
    return (
        <select
            className="strategy-selector"
            onChange={(e) => props.onChange(e.target.value)}
        >
            {props.options.map((o) => (
                <option value={o} key={o}>
                    {o}
                </option>
            ))}
        </select>
    );
};

export default StrategySelector;
