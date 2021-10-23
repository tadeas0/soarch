import * as React from "react";
import { FunctionComponent } from "react";
import { SearchResult } from "../App";
import SearchResultCard from "./searchResultCard";

interface SearchResultsProps {
    searchResults: SearchResult[];
    isBusy: boolean;
}

const SearchResults: FunctionComponent<SearchResultsProps> = ({
    searchResults,
    isBusy,
}) => {
    return (
        <div>
            {isBusy ? (
                <h1>Loading...</h1>
            ) : (
                searchResults.map((s) => <SearchResultCard searchResult={s} />)
            )}
        </div>
    );
};

export default SearchResults;
