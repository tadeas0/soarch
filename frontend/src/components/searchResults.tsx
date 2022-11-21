import * as React from "react";
import { FunctionComponent } from "react";
import { SearchResult } from "../App";
import SearchResultCard from "./searchResultCard";
import RiseLoader from "react-spinners/RiseLoader";
import "./result.css";
import { SECONDARY_COLOR } from "../constants";

interface SearchResultsProps {
    searchResults: SearchResult[];
    isBusy: boolean;
    isPlaying: boolean;
    onEdit: (searchResult: SearchResult) => void;
    onPlay: (searchResult: SearchResult) => void;
}

const SearchResults: FunctionComponent<SearchResultsProps> = ({
    searchResults,
    isBusy,
    isPlaying,
    onEdit,
    onPlay,
}) => {
    return (
        <div className="results-container">
            {isBusy ? (
                <div className="loader">
                    <RiseLoader size={100} color={SECONDARY_COLOR} />
                </div>
            ) : (
                searchResults.map((s) => (
                    <SearchResultCard
                        searchResult={s}
                        onEdit={onEdit}
                        onPlay={onPlay}
                        isPlaying={isPlaying}
                    />
                ))
            )}
        </div>
    );
};

export default SearchResults;
