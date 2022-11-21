import { FunctionComponent } from "react";
import { SearchResult } from "../App";

interface SearchResultProps {
    searchResult: SearchResult;
}

const SearchResultCard: FunctionComponent<SearchResultProps> = ({
    searchResult,
}) => {
    return (
        <div className="result-card">
            <div className="inner">
                <h4>{searchResult.name}</h4>
                <p>{searchResult.artist}</p>
            </div>
        </div>
    );
};

export default SearchResultCard;
