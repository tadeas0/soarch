import { useEffect } from "react";

const useKeyboardListener = (
    onKeyUp: (event: KeyboardEvent) => void,
    onKeyDown: (event: KeyboardEvent) => void
): void => {
    useEffect(() => {
        document.addEventListener("keydown", onKeyDown);
        document.addEventListener("keyup", onKeyUp);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.removeEventListener("keyup", onKeyUp);
        };
    }, [onKeyUp, onKeyDown]);
};

export default useKeyboardListener;
