import { FunctionComponent, useMemo, useState } from "react";
import * as React from "react";
import { BsFillPlayFill, BsPauseFill } from "react-icons/bs";
import { MdModeEdit } from "react-icons/md";
import { SearchResult } from "../interfaces/SearchResult";
import { Sequencer } from "../sound/sequencer";
import { useTabControls } from "../stores/pianoRollStore";
import * as Tone from "tone";
import useOnBeatCallback from "../hooks/sequencer/useOnBeatCallback";

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
    const { canAddTab } = useTabControls();
    const resultLength = useMemo(() => {
        if (!searchResult) return null;

        return Tone.Time(
            Sequencer.rollTimeToToneTime(
                Sequencer.getGridParamsFromNotes(searchResult.notes).width
            )
        ).toSeconds();
    }, [searchResult]);

    useOnBeatCallback(async (time) => {
        if (isPlaying && resultLength) {
            setProgress(((time / resultLength) * 100) % 100);
        }
    });

    const getInlineStyles = () => {
        if (!isPlaying) return {};
        return {
            backgroundImage: `linear-gradient(
                                    90deg,
                                    var(--light-primary-color) 0%,
                                    var(--light-primary-color) ${progress}%,
                                    var(--bg-color) ${progress + 1}%
                               )`,
        };
    };

    return (
        <div className="py-3 px-2" style={getInlineStyles()}>
            <div className="flex h-full w-full flex-row">
                <div className="flex h-full w-5/6 flex-col">
                    <h4>{searchResult.name}</h4>
                    <p className="text-sm">{searchResult.artist}</p>
                </div>
                <div className="flex h-full flex-col">
                    <button
                        className="h-1/2 text-xl outline-none"
                        type="button"
                        onClick={() => onPlay(searchResult)}
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
