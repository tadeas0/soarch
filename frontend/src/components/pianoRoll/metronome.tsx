import { FunctionComponent, useState } from "react";
import { GiMetronome } from "react-icons/gi";
import { Sequencer } from "../../sound/sequencer";

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

    return (
        <button
            className={"top-button" + (active ? " pressed" : "")}
            disabled={disabled}
            onClick={handleClick}
        >
            <GiMetronome />
        </button>
    );
};

export default Metronome;
