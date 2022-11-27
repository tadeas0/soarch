import { FunctionComponent, useEffect, useState } from "react";
import { GiMetronome } from "react-icons/gi";
import { Sequencer } from "../../sound/sequencer";
import Button from "../basic/button";

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
            className={"flex items-center justify-center text-4xl"}
            pressed={active}
            disabled={disabled}
            onClick={handleClick}
        >
            <GiMetronome />
        </Button>
    );
};

export default Metronome;
