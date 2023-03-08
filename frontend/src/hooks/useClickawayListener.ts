import { RefObject, useEffect } from "react";

const useClickawayListener = <T extends HTMLElement>(
    ref: RefObject<T>,
    onClickOutside: () => void
) => {
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                ref.current &&
                event.target &&
                !ref.current.contains(event.target as Node)
            ) {
                onClickOutside();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClickOutside, ref]);
};

export default useClickawayListener;
