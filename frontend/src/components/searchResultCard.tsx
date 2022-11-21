import { FunctionComponent } from "react";
import { BsFillPlayFill, BsPauseFill } from "react-icons/bs";
import { MdModeEdit } from "react-icons/md";
import { SearchResult } from "../App";

interface SearchResultProps {
    searchResult: SearchResult;
    isPlaying: boolean;
    onPlay: (searchResult: SearchResult) => void;
    onEdit: (searchResult: SearchResult) => void;
}

const SearchResultCard: FunctionComponent<SearchResultProps> = ({
    searchResult,
    isPlaying,
    onEdit,
    onPlay,
}) => {
    return (
        <div className="result-card">
            <div className="card-inner">
                <div className="card-text">
                    <h4>{searchResult.name}</h4>
                    <p>{searchResult.artist}</p>
                </div>
                <div className="card-buttons">
                    <button onClick={() => onPlay(searchResult)}>
                        {isPlaying ? <BsPauseFill /> : <BsFillPlayFill />}
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
