import { FunctionComponent, useEffect, useState } from "react";
import { SlArrowLeft } from "react-icons/sl";
import { SearchResult } from "../App";
import { HiOutlineMagnifyingGlassMinus } from "react-icons/hi2";
import SearchResultCard from "./searchResultCard";
import "./searchResultsDrawer.css";
import { SECONDARY_COLOR } from "../constants";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import PuffLoader from "react-spinners/PuffLoader";

interface SearchResultsDrawerProps {
    searchResults: SearchResult[];
    isBusy: boolean;
    onEdit: (searchResult: SearchResult) => void;
}

const SearchResultsDrawer: FunctionComponent<SearchResultsDrawerProps> = ({
    searchResults,
    isBusy,
    onEdit,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => {
        setIsOpen((prevState) => !prevState);
    };

    const handleEdit = (searchResult: SearchResult) => {
        setIsOpen(false);
        onEdit(searchResult);
    };

    useEffect(() => {
        if (searchResults.length > 0 || isBusy) setIsOpen(true);
    }, [searchResults, isBusy]);

    const renderDrawerBody = () => {
        if (isBusy) {
            return (
                <div className="loader">
                    <PuffLoader size={100} color={SECONDARY_COLOR} />
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
                        <SearchResultCard
                            searchResult={s}
                            onEdit={handleEdit}
                        />
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
