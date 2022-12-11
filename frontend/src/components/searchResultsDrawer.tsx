import { useState } from "react";
import { SlArrowLeft } from "react-icons/sl";
import { SearchResult } from "../interfaces/SearchResult";
import { HiOutlineMagnifyingGlassMinus } from "react-icons/hi2";
import SearchResultCard from "./searchResultCard";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import PuffLoader from "react-spinners/PuffLoader";
import { Sequencer } from "../sound/sequencer";
import Button from "./basic/button";
import * as React from "react";
import { BLACK } from "../constants";
import useSequencer from "../hooks/sequencer/useSequencer";

type SearchResultsDrawerProps = {
    searchResults: SearchResult[];
    isBusy: boolean;
    onEdit: (searchResult: SearchResult) => void;
    onOpen: () => void;
    onClose: () => void;
    isOpen: boolean;
};

const SearchResultsDrawer = (props: SearchResultsDrawerProps) => {
    const [playingResult, setPlayingResult] = useState<SearchResult | null>(
        null
    );
    const { play, stop } = useSequencer();

    const handleEdit = (searchResult: SearchResult) => {
        props.onEdit(searchResult);
    };

    const handlePlay = (searchResult: SearchResult) => {
        stop();
        if (searchResult !== playingResult) {
            const gridParams = Sequencer.getGridParamsFromNotes(
                searchResult.notes
            );
            play(
                searchResult.notes,
                searchResult.bpm,
                Sequencer.rollTimeToToneTime(gridParams.width)
            );
            setPlayingResult(searchResult);
        } else {
            setPlayingResult(null);
        }
    };

    const renderDrawerBody = () => {
        if (props.isBusy) {
            return (
                <div className="flex h-full w-full flex-row items-center justify-center bg-background">
                    <PuffLoader size={100} color={BLACK} />
                </div>
            );
        }
        if (!props.isBusy && props.searchResults.length === 0) {
            return (
                <div>
                    <div>
                        <HiOutlineMagnifyingGlassMinus />
                    </div>
                    <div>No results...</div>
                </div>
            );
        }
        return (
            <div className="h-full bg-background p-3 text-black">
                <h1 className="mb-4 text-3xl">Search results</h1>
                <ul className="mx-2">
                    {props.searchResults.map((s) => (
                        <li className="w-full border-b-2 border-black last:border-b-0">
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

export default SearchResultsDrawer;
