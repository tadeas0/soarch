import { SearchResult } from "../interfaces/SearchResult";
import SearchResultCard from "./searchResultCard";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import PuffLoader from "react-spinners/PuffLoader";
import Button from "./basic/button";
import * as React from "react";
import { BLACK, WHITE } from "../constants";
import { AiOutlineSearch } from "react-icons/ai";

type SearchResultsDrawerProps = {
    searchResults: SearchResult[];
    isBusy: boolean;
    onEdit: (searchResult: SearchResult) => void;
    onOpen: () => void;
    onClose: () => void;
    isOpen: boolean;
};

const SearchResultsDrawer = (props: SearchResultsDrawerProps) => {
    const handleEdit = (searchResult: SearchResult) => {
        props.onEdit(searchResult);
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
                <div className="h-full bg-background p-3 text-black">
                    <h1 className="mt-2 text-xl">
                        No results yet. Try inputting some notes.
                    </h1>
                </div>
            );
        }
        return (
            <div className="h-full overflow-y-scroll bg-background p-3 text-black">
                <h1 className="mb-4 text-3xl">Search results</h1>
                <ul className="mx-2">
                    {props.searchResults.map((s) => (
                        <li className="w-full border-b-2 border-black last:border-b-0">
                            <SearchResultCard
                                searchResult={s}
                                onEdit={handleEdit}
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
                {props.isBusy ? (
                    <PuffLoader color={WHITE} size={20} />
                ) : (
                    <AiOutlineSearch size={20} />
                )}
            </Button>
            <Drawer
                open={props.isOpen}
                onClose={props.onClose}
                direction="right"
                zIndex={20}
                size="500px"
            >
                {renderDrawerBody()}
            </Drawer>
        </>
    );
};

export default SearchResultsDrawer;
