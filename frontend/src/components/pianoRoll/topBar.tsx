import * as React from "react";
import { FunctionComponent, useState } from "react";
import { SlArrowDown, SlArrowUp } from "react-icons/sl";
import { SearchResult } from "../../interfaces/SearchResult";
import Button from "../basic/button";
import TopButtons from "./topButtons";
import TopResult from "./topResult";
import Drawer from "react-modern-drawer";
import { Sequencer } from "../../hooks/sequencer/useSequencer";
import useIsXlScreen from "../../hooks/useIsXlScreen";

interface TopBarProps {
    searchResult: SearchResult | undefined;
    isBusy: boolean;
    onShowMore: () => void;
    disabled: boolean;
    rollSequencer: Sequencer;
}

const TopDiv: FunctionComponent<TopBarProps & { isXl: boolean }> = (props) => (
    <div className="grid w-full grid-cols-7 justify-center gap-1 border-b-2 border-black bg-background p-2 xl:grid-cols-11 xl:gap-4 xl:border-none">
        {props.isXl && (
            <TopResult
                searchResult={props.searchResult}
                isBusy={props.isBusy}
                onShowMore={props.onShowMore}
            />
        )}
        <TopButtons
            rollSequencer={props.rollSequencer}
            disabled={props.disabled}
        />
    </div>
);

const TopBar: FunctionComponent<TopBarProps> = (props) => {
    const [show, setShow] = useState(false);
    const isXl = useIsXlScreen();

    if (isXl) {
        return <TopDiv isXl={isXl} {...props} />;
    }

    return (
        <>
            <Drawer
                open={show}
                direction="top"
                onClose={() => setShow(false)}
                enableOverlay={false}
                zIndex={20}
                style={{
                    height: "fit-content",
                    background: "0",
                    boxShadow: "none",
                }}
            >
                <TopDiv isXl={isXl} {...props} />
                <div className="flex flex-col items-center">
                    <Button
                        onClick={() => setShow((current) => !current)}
                        className="text-md rounded-t-none p-1 px-4 xl:hidden"
                    >
                        <SlArrowUp />
                    </Button>
                </div>
            </Drawer>
            <Button
                onClick={() => setShow((current) => !current)}
                className="text-md absolute top-0 left-1/2 -translate-x-1/2 rounded-t-none p-1 px-4 xl:hidden"
            >
                <SlArrowDown />
            </Button>
        </>
    );
};

export default TopBar;
