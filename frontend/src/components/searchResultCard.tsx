import { FunctionComponent } from "react";
import * as React from "react";
import { BsFillPlayFill, BsPauseFill } from "react-icons/bs";
import { MdModeEdit } from "react-icons/md";
import { SearchResult } from "../interfaces/SearchResult";
import {
    getGridParamsFromNotes,
    rollTimeToToneTime,
} from "../common/coordConversion";
import useSequencer from "../hooks/sequencer/useSequencer";
import { useTabControls } from "../stores/pianoRollStore";

interface SearchResultProps {
    searchResult: SearchResult;
    onEdit: (searchResult: SearchResult) => void;
}

const SearchResultCard: FunctionComponent<SearchResultProps> = ({
    searchResult,
    onEdit,
}) => {
    const { canAddTab } = useTabControls();
    const { play, stop, isPlaying, progress } = useSequencer();

    const handlePlay = () => {
        if (!isPlaying) {
            const gridParams = getGridParamsFromNotes(searchResult.notes);
            play(
                searchResult.notes,
                searchResult.bpm,
                rollTimeToToneTime(gridParams.width)
            );
        } else {
            stop();
        }
    };

    const getInlineStyles = () => {
        if (!isPlaying) return {};
        return {
            backgroundImage: `linear-gradient(
                                    90deg,
                                    var(--light-primary-color) 0%,
                                    var(--light-primary-color) ${
                                        progress * 100
                                    }%,
                                    var(--bg-color) ${progress * 100 + 1}%
                               )`,
        };
    };

    return (
        <div className="py-3 px-1" style={getInlineStyles()}>
            <div className="flex h-full w-full flex-row">
                <h3 className="pr-2 text-xl">{searchResult.similarity}</h3>
                <div className="flex h-full w-5/6 flex-col">
                    <h4>{searchResult.name}</h4>
                    <p className="text-sm">{searchResult.artist}</p>
                </div>
                <div className="flex h-full flex-col">
                    <button
                        className="h-1/2 text-xl outline-none"
                        type="button"
                        onClick={() => handlePlay()}
                    >
                        {isPlaying ? <BsPauseFill /> : <BsFillPlayFill />}
                    </button>
                    {canAddTab && (
                        <button
                            className="h-1/2 text-xl outline-none"
                            type="button"
                            onClick={() => onEdit(searchResult)}
                        >
                            <MdModeEdit />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchResultCard;
