import { FunctionComponent, useState } from "react";
import "./instrumentSelector.css";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import { SynthPreset } from "../../sound/synthPresets";
import { Sequencer } from "../../sound/sequencer";

const InstrumentSelector: FunctionComponent = () => {
    const initOption = Sequencer.getSynthPresets()[0];
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [selectedOption, setSelectedOption] =
        useState<SynthPreset>(initOption);

    if (initOption === undefined) {
        return <div className="instrument-selector"></div>; // return empty div
    }

    const onOptionSelected = (option: SynthPreset) => {
        if (!Sequencer.isInitialized()) Sequencer.init();
        if (isOpen) {
            setIsOpen(false);
        }
        setSelectedOption(option);
        Sequencer.setSynthPreset(option);
    };

    return (
        <div className="instrument-selector">
            <button
                className="selected-instrument"
                onClick={(e) => {
                    setIsOpen(!isOpen);
                }}
            >
                {<selectedOption.icon />}
                <div className="instrument-selector-arrow">
                    {isOpen ? <IoMdArrowDropup /> : <IoMdArrowDropdown />}
                </div>
            </button>
            <div className="instrument-container">
                {isOpen &&
                    Sequencer.getSynthPresets().map((o, i) => (
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
        </div>
    );
};

export default InstrumentSelector;
