import * as React from "react";
import { FunctionComponent } from "react";
import "./instrumentSelector.css";
import {IoMdArrowDropdown, IoMdArrowDropup} from "react-icons/io";

export interface Option {
    name: string;
    icon: JSX.Element;
    value: string;
}

interface InstrumentSelectorProps {
    options: Option[];
    selectedValue?: Option;
    onChange: (newValue: Option) => void;
}

const InstrumentSelector : FunctionComponent<InstrumentSelectorProps> = props => {
    const initOption = props.selectedValue !== undefined ? props.selectedValue : props.options[0];
    const [isOpen, setIsOpen] = React.useState<boolean>(false);
    const [selectedOption, setSelectedOption] = React.useState<Option>(initOption);

    if (initOption === undefined) {
        return (<div className="instrument-selector"></div>);  // return empty div
    }

    const onOptionSelected = (option: Option) => {
        if (isOpen) {
            setIsOpen(false);
        }
        setSelectedOption(option);
        props.onChange(option);
    }

    return (
        <div className="instrument-selector">
            <button className="selected-instrument"
                onClick={
                    (e) => {
                        setIsOpen(!isOpen);
                    }
                }
            >
                {selectedOption.icon}
                <div className="instrument-selector-arrow">
                    {isOpen ? <IoMdArrowDropup/> : <IoMdArrowDropdown/>}
                </div>
            </button>
            <div className="instrument-container">
                {isOpen && props.options.map((o, i) => (
                    <div
                        key={o.value}
                        title={o.name}
                        onClick={_ => onOptionSelected(props.options[i])}
                    >{o.icon}</div>
                ))
                }
            </div>
        </div>
    );
}

export default InstrumentSelector;