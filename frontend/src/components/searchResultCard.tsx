import { FunctionComponent } from "react";
import { BsFillPlayFill } from "react-icons/bs";
import { MdModeEdit } from "react-icons/md";
import { SearchResult } from "../App";

interface SearchResultProps {
    searchResult: SearchResult;
    onEdit: (searchResult: SearchResult) => void;
}

const SearchResultCard: FunctionComponent<SearchResultProps> = ({
    searchResult,
    onEdit,
}) => {
    return (
        <div className="result-card">
            <div className="card-inner">
                <div className="card-text">
                    <h4>{searchResult.name}</h4>
                    <p>{searchResult.artist}</p>
                </div>
                <div className="card-buttons">
                    <button>
                        <BsFillPlayFill />
                    </button>
                    <button onClick={() => onEdit(searchResult)}>
                        <MdModeEdit />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SearchResultCard;
