import { FunctionComponent, useEffect, useState } from "react";
import { GiMetronome } from "react-icons/gi";
import { Sequencer } from "../../sound/sequencer";
import Button from "../basic/button";
import * as React from "react";

interface MetronomeProps {
    disabled?: boolean;
}

const Metronome: FunctionComponent<MetronomeProps> = ({ disabled = false }) => {
    const [active, setActive] = useState(Sequencer.getMetronomeEnabled());

    const handleClick = () => {
        if (active) {
            Sequencer.disableMetronome();
        } else {
            Sequencer.enableMetronome();
        }
        setActive(Sequencer.getMetronomeEnabled());
    };

    useEffect(() => {
        if (disabled) {
            Sequencer.disableMetronome();
            setActive(false);
        }
    }, [disabled]);

    return (
        <Button
            id="metronome-button"
            className="flex items-center justify-center text-6xl"
            pressed={active}
            disabled={disabled}
            onClick={handleClick}
        >
            <GiMetronome />
        </Button>
    );
};

Metronome.defaultProps = {
    disabled: false,
};

export default Metronome;
