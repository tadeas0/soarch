import * as React from "react";
import { FunctionComponent, useEffect, useState } from "react";
import { SlArrowLeft } from "react-icons/sl";
import { SearchResult } from "../App";
import { HiOutlineMagnifyingGlassMinus } from "react-icons/hi2";
import SearchResultCard from "./searchResultCard";
import RiseLoader from "react-spinners/RiseLoader";
import "./searchResultsDrawer.css";
import { SECONDARY_COLOR } from "../constants";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";

interface SearchResultsDrawerProps {
    searchResults: SearchResult[];
    isBusy: boolean;
}

const SearchResultsDrawer: FunctionComponent<SearchResultsDrawerProps> = ({
    searchResults,
    isBusy,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => {
        setIsOpen((prevState) => !prevState);
    };

    useEffect(() => {
        if (searchResults.length > 0 || isBusy) setIsOpen(true);
    }, [searchResults, isBusy]);

    const renderDrawerBody = () => {
        if (isBusy) {
            return (
                <div className="loader">
                    <RiseLoader size={100} color={SECONDARY_COLOR} />
                </div>
            );
        } else if (!isBusy && searchResults.length === 0) {
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
                    {searchResults.map((s) => (
                        <>
                            <SearchResultCard searchResult={s} />
                        </>
                    ))}
                </>
            );
        }
    };

    return (
        <>
            <button className="drawer-button" onClick={toggleOpen}>
                <SlArrowLeft />
            </button>
            <Drawer
                open={isOpen}
                onClose={toggleOpen}
                direction="right"
                className="drawer"
            >
                <div className="drawer-container">{renderDrawerBody()}</div>
            </Drawer>
        </>
    );
};

export default SearchResultsDrawer;
