import { FunctionComponent, useEffect, useState } from "react";
import { BsPauseFill, BsFillPlayFill } from "react-icons/bs";
import { MdModeEdit } from "react-icons/md";
import { SearchResult } from "../../interfaces/SearchResult";
import ClipLoader from "react-spinners/ClipLoader";
import { useTabControls } from "../../stores/pianoRollStore";
import * as React from "react";
import { BLACK, WHITE } from "../../constants";
import useSequencer from "../../hooks/sequencer/useSequencer";
import {
    getGridParamsFromNotes,
    rollTimeToToneTime,
} from "../../common/coordConversion";
import { BarLoader } from "react-spinners";

interface TopResultProps {
    searchResult?: SearchResult;
    isBusy: boolean;
    onShowMore: () => void;
}

const TopResult: FunctionComponent<TopResultProps> = (props) => {
    const { canAddTab, addTab } = useTabControls();
    const [lastResult, setLastResult] = useState<null | SearchResult>(null);
    const [shouldPing, setShouldPing] = useState(false);
    const [pingTimeout, setPingTimeout] = useState<number>(0);
    const [shouldColor, setShouldColor] = useState(false);
    const { isPlaying, stop, play, progress } = useSequencer();

    const getInlineStyles = () => {
        if (!isPlaying) return {};
        return {
            backgroundImage: `linear-gradient(
                                    90deg,
                                    var(--medium-primary-color) 0%,
                                    var(--medium-primary-color) ${
                                        progress * 100
                                    }%,
                                    var(--light-primary-color) ${
                                        progress * 100 + 1
                                    }%
                               )`,
        };
    };

    useEffect(() => {
        if (props.searchResult === undefined) {
            setLastResult(null);
            setShouldColor(false);
        }
        if (
            props.searchResult?.name !== lastResult?.name &&
            props.searchResult !== undefined
        ) {
            setLastResult(props.searchResult);
            setShouldPing(true);
            setShouldColor(true);
            clearTimeout(pingTimeout);
            const t = setTimeout(() => {
                setShouldPing(false);
            }, 1000);
            setPingTimeout(t);
        }
    }, [lastResult, pingTimeout, props.searchResult]);

    const handlePlayClick = async () => {
        if (isPlaying) {
            stop();
        } else if (props.searchResult) {
            play(
                props.searchResult.notes,
                props.searchResult.bpm,
                rollTimeToToneTime(
                    getGridParamsFromNotes(props.searchResult.notes).width
                )
            );
        }
    };

    const handleEdit = async () => {
        if (props.searchResult) {
            stop();
            addTab({
                ...props.searchResult,
                bpm: Math.round(props.searchResult.bpm),
                gridParams: getGridParamsFromNotes(props.searchResult.notes),
            });
        }
    };

    const renderEmpty = () => (
        <div>
            <h4>No results yet. Try inputing some notes.</h4>
        </div>
    );

    const renderResult = (sr: SearchResult) => (
        <>
            {true && (
                <BarLoader
                    cssOverride={{
                        width: "100%",
                        opacity: props.isBusy ? 1 : 0,
                    }}
                    color={shouldColor ? BLACK : WHITE}
                />
            )}
            <h1 className="h-1/5 font-semibold">Best result:</h1>
            <div className="flex h-3/5 w-full flex-row">
                <div className="max-h-full w-5/6 ">
                    <h4 className="mt-0.5 text-lg leading-4">{sr.name}</h4>
                    <p className="text-sm">{sr.artist}</p>
                </div>
                <div className="flex h-full w-1/6 flex-col justify-evenly">
                    <button
                        className="text-xl outline-none"
                        type="button"
                        onClick={handlePlayClick}
                    >
                        {isPlaying ? <BsPauseFill /> : <BsFillPlayFill />}
                    </button>
                    <button
                        type="button"
                        onClick={handleEdit}
                        className={`outline-none text-xl${
                            canAddTab ? "" : " inactive"
                        }`}
                    >
                        <MdModeEdit />
                    </button>
                </div>
            </div>
            <button
                type="button"
                onClick={props.onShowMore}
                className="w-full pr-2 text-right underline outline-none"
            >
                Show more results
            </button>
        </>
    );

    const renderInner = () => {
        const sr = props.searchResult;
        if (sr === undefined) {
            return renderEmpty();
        }
        return renderResult(sr);
    };

    return (
        <div
            id="top-result"
            className={`relative col-span-2 h-28 rounded p-1 pb-2 transition-colors ${
                shouldColor
                    ? "bg-medium-primary text-black"
                    : "bg-light-primary text-white"
            }`}
            onMouseEnter={() => setShouldColor(false)}
            style={getInlineStyles()}
        >
            {shouldPing && (
                <div className="absolute top-0 bottom-0 left-0 right-0 animate-ping rounded border-4 border-medium-primary bg-transparent" />
            )}
            {props.isBusy && !props.searchResult ? (
                <div className="flex h-full flex-row items-center justify-center">
                    <ClipLoader size={24} color={WHITE} />
                    <h4 className="ml-2">Searching...</h4>
                </div>
            ) : (
                renderInner()
            )}
        </div>
    );
};

TopResult.defaultProps = {
    searchResult: undefined,
};

export default TopResult;
