import { FunctionComponent, useEffect, useState } from "react";
import { BsFillPlayFill, BsPauseFill } from "react-icons/bs";
import { MdModeEdit } from "react-icons/md";
import { SearchResult } from "../App";
import { Sequencer } from "../sound/sequencer";

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
    const [progress, setProgress] = useState(0);

    const getInlineStyles = () => {
        if (!isPlaying) return {};
        return {
            backgroundImage: `linear-gradient(
                                    90deg,
                                    var(--secondary-color) 0%,
                                    var(--secondary-color) ${progress}%,
                                    var(--bg-color) ${progress + 1}%
                               )`,
        };
    };

    useEffect(() => {
        (async () => {
            if (isPlaying) {
                await Sequencer.clearOnBeatCallbacks();
                await Sequencer.runCallbackOnBeat(() =>
                    setProgress(Sequencer.getProgress() * 100)
                );
            }
        })();
    }, [isPlaying]);

    return (
        <div className="result-card" style={getInlineStyles()}>
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
