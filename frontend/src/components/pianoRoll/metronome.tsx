import { FunctionComponent, useEffect } from "react";
import { GiMetronome } from "react-icons/gi";
import Button from "../basic/button";
import * as React from "react";
import useMetronome from "../../hooks/sequencer/useMetronome";
import { useRollSequencer } from "../../context/pianorollContext";

interface MetronomeProps {
    disabled?: boolean;
}

const Metronome: FunctionComponent<MetronomeProps> = ({ disabled = false }) => {
    const sequencer = useRollSequencer();
    const { enabled, setEnabled } = useMetronome(sequencer.delay);

    const handleClick = () => {
        setEnabled(!enabled);
    };

    useEffect(() => {
        if (disabled) {
            setEnabled(false);
        }
    }, [disabled, setEnabled]);

    return (
        <Button
            id="metronome-button"
            className="flex items-center justify-center text-4xl xl:text-6xl"
            pressed={enabled}
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
