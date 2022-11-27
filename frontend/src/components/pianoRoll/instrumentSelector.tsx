import { useState } from "react";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import { SynthPreset } from "../../sound/synthPresets";
import { Sequencer } from "../../sound/sequencer";
import Button from "../basic/button";

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
        <div
            className={
                "relative col-span-1 inline-block rounded bg-transparent p-0 text-4xl" +
                (isOpen ? " bg-medium-primary" : "")
            }
        >
            <Button
                className="flex h-full w-full items-center justify-center p-4"
                onClick={(e) => {
                    setIsOpen(!isOpen);
                }}
                pressed={isOpen}
                disabled={props.disabled}
            >
                {<selectedOption.icon />}
                <div className="text-md absolute right-1 bottom-0">
                    {isOpen ? <IoMdArrowDropup /> : <IoMdArrowDropdown />}
                </div>
            </Button>
            {isOpen && (
                <div className="absolute block w-full rounded bg-light-primary">
                    {Sequencer.getSynthPresets().map((o, i) => (
                        <Button
                            className="flex justify-center w-full rounded py-2 px-4 text-white hover:bg-medium-primary hover:text-black"
                            key={i}
                            title={o.name}
                            onClick={(_) =>
                                onOptionSelected(Sequencer.getSynthPresets()[i])
                            }
                        >
                            {<o.icon />}
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );
};

InstrumentSelector.defaultProps = defaultProps;

export default InstrumentSelector;
