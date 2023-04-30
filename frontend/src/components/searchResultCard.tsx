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
import SpotifyPlayer from "./pianoRoll/spotifyPlayer";
import useProgress from "../hooks/sequencer/useProgress";

interface SearchResultProps {
    searchResult: SearchResult;
    onEdit: (searchResult: SearchResult) => void;
}

const SearchResultCard: FunctionComponent<SearchResultProps> = ({
    searchResult,
    onEdit,
}) => {
    const { canAddTab } = useTabControls();
    const sequencer = useSequencer();
    const { play, stop, isPlaying } = sequencer;
    const progress = useProgress(sequencer.isPlaying);

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
            <div className="flex h-full w-full flex-row justify-between">
                <h3 className="pr-2 text-xl">{searchResult.similarity}</h3>
                <div className="flex h-full w-5/6 flex-col">
                    <h4>{searchResult.name}</h4>
                    <p className="text-sm">{searchResult.artist}</p>
                    {searchResult.spotifyUrl && (
                        <a
                            className="self-end underline"
                            href={searchResult.spotifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Show on Spotify
                        </a>
                    )}
                </div>
                <div className="flex h-full flex-col self-end">
                    <SpotifyPlayer previewUrl={searchResult.previewUrl} />
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
