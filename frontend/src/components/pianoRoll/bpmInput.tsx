import { FunctionComponent } from "react";
import { HiPlus, HiMinus } from "react-icons/hi";
import "./bpmInput.css"

interface BPMInputProps {
    value: number;
    min: number;
    max: number;
    disabled: boolean;
    onChange: Function;
    increment: number;
};

const BPMInput: FunctionComponent<BPMInputProps> = (props: BPMInputProps) => {
    const increment = props.increment === undefined ? 5 : props.increment;

    const changeValue = (delta: number) => {
        const newValue = props.value + delta;
        const clamped = Math.min(Math.max(newValue, props.min), props.max);
        props.onChange(clamped);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const value = Number(e.target.value);
        
        props.onChange(value);
    }

    const onFocusLose = (e: React.FocusEvent<HTMLInputElement>) => {
        const clamped = Math.min(Math.max(props.value, props.min), props.max);
        if (clamped !== props.value) {
            props.onChange(clamped);
        }
    }
    
    return (
        <div className="bpm-input">
            <div className={`bpm-input-icon ${props.disabled || props.value <= props.min ? 'disabled' : ''}`} onClick={e => changeValue(-increment)} ><HiMinus/></div>
            <input
                type="number"
                value={props.value}
                onChange={handleChange}
                max={props.max}
                min={props.min}
                disabled={props.disabled}
                onBlur={onFocusLose}
            ></input>
            <div className={`bpm-input-icon ${props.disabled || props.value >= props.max ? 'disabled' : ''}`} onClick={e => changeValue(increment)}><HiPlus/></div>
        </div>
        
    );
};

export default BPMInput;
