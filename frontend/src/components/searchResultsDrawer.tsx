import { useState } from "react";
import { SlArrowLeft } from "react-icons/sl";
import { SearchResult } from "../routes/pianoRollRoute";
import { HiOutlineMagnifyingGlassMinus } from "react-icons/hi2";
import SearchResultCard from "./searchResultCard";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import PuffLoader from "react-spinners/PuffLoader";
import usePlayback from "../hooks/usePlayback";
import { Sequencer } from "../sound/sequencer";
import Button from "./basic/button";

const defaultProps = {
    onToggle: () => {},
};

type SearchResultsDrawerProps = {
    searchResults: SearchResult[];
    isBusy: boolean;
    onEdit: (searchResult: SearchResult) => void;
    onOpen: () => void;
    onClose: () => void;
    isOpen: boolean;
} & typeof defaultProps;

const SearchResultsDrawer = (props: SearchResultsDrawerProps) => {
    const [playingResult, setPlayingResult] = useState<SearchResult | null>(
        null
    );
    const [, handleStart, handleStop] = usePlayback();

    const handleEdit = (searchResult: SearchResult) => {
        props.onEdit(searchResult);
    };

    const handlePlay = (searchResult: SearchResult) => {
        handleStop();
        if (searchResult !== playingResult) {
            const gridParams = Sequencer.getGridParamsFromNotes(
                searchResult.notes
            );
            handleStart(searchResult.notes, searchResult.bpm, gridParams.width);
            setPlayingResult(searchResult);
        } else {
            setPlayingResult(null);
        }
    };

    const renderDrawerBody = () => {
        if (props.isBusy) {
            return (
                <div className="flex h-full w-full flex-row items-center justify-center">
                    <PuffLoader size={100} />
                </div>
            );
        } else if (!props.isBusy && props.searchResults.length === 0) {
            return (
                <div>
                    <div>
                        <HiOutlineMagnifyingGlassMinus />
                    </div>
                    <div>No results...</div>
                </div>
            );
        } else {
            return (
                <div className="h-full bg-background p-3">
                    <h1 className="mb-4 text-3xl">Search results</h1>
                    <ul className="mx-2">
                        {props.searchResults.map((s) => (
                            <li className="my-2 w-full border-b-2 border-dark-primary py-2 last:border-b-0">
                                <SearchResultCard
                                    searchResult={s}
                                    isPlaying={s === playingResult}
                                    onEdit={handleEdit}
                                    onPlay={handlePlay}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            );
        }
    };

    return (
        <>
            <Button
                className="absolute right-0 top-1/2 rounded-r-none border-r-0 py-4"
                onClick={props.onOpen}
            >
                <SlArrowLeft />
            </Button>
            <Drawer
                open={props.isOpen}
                onClose={props.onClose}
                direction="right"
            >
                {renderDrawerBody()}
            </Drawer>
        </>
    );
};

SearchResultsDrawer.defaultProps = {
    onToggle: () => {},
};

export default SearchResultsDrawer;
