import { FunctionComponent } from "react";
import { HiPlus, HiMinus } from "react-icons/hi";
import Button from '../basic/button'

interface BPMInputProps {
    value: number;
    min: number;
    max: number;
    disabled: boolean;
    onChange: Function;
    increment: number;
}

const BPMInput: FunctionComponent<BPMInputProps> = (props: BPMInputProps) => {
    const increment = props.increment === undefined ? 5 : props.increment;

    const changeValue = (delta: number) => {
        if (props.disabled){
            return;
        }
        const newValue = Math.floor(props.value + delta);
        const clamped = Math.min(Math.max(newValue, props.min), props.max);
        props.onChange(clamped);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const value = Math.floor(Number(e.target.value));
        e.target.value = value.toString(); // remove prefix 0

        props.onChange(value);
    };

    const onFocusLose = (e: React.FocusEvent<HTMLInputElement>) => {
        const clamped = Math.min(Math.max(props.value, props.min), props.max);
        if (clamped !== props.value) {
            props.onChange(clamped);
        }
    };

    return (
        <div className="col-span-3 flex flex-row items-center justify-center self-center justify-self-center rounded bg-light-primary p-4">
            <Button
                className="flex-grow-0 p-0 text-white text-xl"
                disabled={props.disabled || props.value <= props.min}
                onClick={(e) => changeValue(-increment)}
            >
                <HiMinus />
            </Button>
            <input
                maxLength={3}
                type="number"
                className="max-w-3xs flex-grow-0 appearance-none border-none bg-transparent p-0 text-center text-4xl text-white outline-none"
                value={props.value}
                onChange={handleChange}
                max={props.max}
                min={props.min}
                disabled={props.disabled}
                onBlur={onFocusLose}
            ></input>
            <Button
                className="flex-grow-0 p-0 text-white text-xl"
                disabled={props.disabled || props.value >= props.max}
                onClick={(e) => changeValue(increment)}
            >
                <HiPlus />
            </Button>
        </div>
    );
};

export default BPMInput;
