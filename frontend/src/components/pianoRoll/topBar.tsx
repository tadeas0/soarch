import * as React from "react";
import { FunctionComponent, useState } from "react";
import { SlArrowDown, SlArrowUp } from "react-icons/sl";
import { SearchResult } from "../../interfaces/SearchResult";
import Button from "../basic/button";
import TopButtons from "./topButtons";
import TopResult from "./topResult";
import Drawer from "react-modern-drawer";
import { useMediaQuery } from "react-responsive";
import { Sequencer } from "../../hooks/sequencer/useSequencer";

interface TopBarProps {
    searchResult: SearchResult | undefined;
    isBusy: boolean;
    onShowMore: () => void;
    disabled: boolean;
    rollSequencer: Sequencer;
}

const TopBar: FunctionComponent<TopBarProps> = (props) => {
    const [show, setShow] = useState(false);
    const isXl = useMediaQuery({ minWidth: 1280 });

    const renderTopDiv = () => (
        <div className="grid w-full grid-cols-8 justify-center gap-1 border-b-2 border-black bg-background p-2 xl:grid-cols-10 xl:gap-4 xl:border-none">
            {isXl && (
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

    if (isXl) {
        return renderTopDiv();
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
                {renderTopDiv()}
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
