import { useState } from "react";
import { SlArrowLeft } from "react-icons/sl";
import { SearchResult } from "../routes/pianoRollRoute";
import { HiOutlineMagnifyingGlassMinus } from "react-icons/hi2";
import SearchResultCard from "./searchResultCard";
import "./searchResultsDrawer.css";
import { SECONDARY_COLOR } from "../constants";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import PuffLoader from "react-spinners/PuffLoader";
import usePlayback from "../hooks/usePlayback";
import { Sequencer } from "../sound/sequencer";

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
                <div className="loader">
                    <PuffLoader size={100} color={SECONDARY_COLOR} />
                </div>
            );
        } else if (!props.isBusy && props.searchResults.length === 0) {
            return (
                <div className="empty-results">
                    <div>
                        <HiOutlineMagnifyingGlassMinus />
                    </div>
                    <div>No results...</div>
                </div>
            );
        } else {
            return (
                <>
                    <h1>Search results</h1>
                    {props.searchResults.map((s) => (
                        <SearchResultCard
                            searchResult={s}
                            isPlaying={s === playingResult}
                            onEdit={handleEdit}
                            onPlay={handlePlay}
                        />
                    ))}
                </>
            );
        }
    };

    return (
        <>
            <button className="drawer-button" onClick={props.onOpen}>
                <SlArrowLeft />
            </button>
            <Drawer
                open={props.isOpen}
                onClose={props.onClose}
                direction="right"
                className="drawer"
            >
                <div className="drawer-container">{renderDrawerBody()}</div>
            </Drawer>
        </>
    );
};

SearchResultsDrawer.defaultProps = {
    onToggle: () => {},
};

export default SearchResultsDrawer;
