import { useState } from "react";
import "./instrumentSelector.css";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import { SynthPreset } from "../../sound/synthPresets";
import { Sequencer } from "../../sound/sequencer";

const defaultProps = {
    disabled: false,
};

type InstrumentSelectorProps = {
    disabled?: boolean;
} & typeof defaultProps;

const InstrumentSelector = (props: InstrumentSelectorProps) => {
    const initOption = Sequencer.getSynthPresets()[0];
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [selectedOption, setSelectedOption] =
        useState<SynthPreset>(initOption);

    if (initOption === undefined) {
        return <div className="instrument-selector"></div>; // return empty div
    }

    const onOptionSelected = (option: SynthPreset) => {
        if (!props.disabled) {
            if (!Sequencer.isInitialized()) Sequencer.init();
            if (isOpen) {
                setIsOpen(false);
            }
            setSelectedOption(option);
            Sequencer.setSynthPreset(option);
        }
    };

    return (
        <button
            className="top-button instrument-selector"
            disabled={props.disabled}
        >
            <button
                className="instrument-selector-button"
                onClick={(e) => {
                    setIsOpen(!isOpen);
                }}
                disabled={props.disabled}
            >
                {<selectedOption.icon />}
                <div className="instrument-selector-arrow">
                    {isOpen ? <IoMdArrowDropup /> : <IoMdArrowDropdown />}
                </div>
            </button>
            {isOpen && (
                <div className="instrument-container">
                    {Sequencer.getSynthPresets().map((o, i) => (
                        <div
                            key={i}
                            title={o.name}
                            onClick={(_) =>
                                onOptionSelected(Sequencer.getSynthPresets()[i])
                            }
                        >
                            {<o.icon />}
                        </div>
                    ))}
                </div>
            )}
        </button>
    );
};

InstrumentSelector.defaultProps = defaultProps;

export default InstrumentSelector;
