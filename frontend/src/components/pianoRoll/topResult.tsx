import { FunctionComponent, useEffect, useState } from "react";
import { BsPauseFill, BsFillPlayFill } from "react-icons/bs";
import { MdModeEdit } from "react-icons/md";
import { SearchResult } from "../../interfaces/SearchResult";
import { Sequencer } from "../../sound/sequencer";
import ClipLoader from "react-spinners/ClipLoader";
import { usePianoRollStore, useTabControls } from "../../stores/pianoRollStore";
import * as React from "react";
import { WHITE } from "../../constants";

interface TopResultProps {
    searchResult?: SearchResult;
    isBusy: boolean;
    onShowMore: () => void;
}

const TopResult: FunctionComponent<TopResultProps> = (props) => {
    const [progress, setProgress] = useState(0);
    const { canAddTab, addTab } = useTabControls();
    const [lastResult, setLastResult] = useState<null | SearchResult>(null);
    const [shouldPing, setShouldPing] = useState(false);
    const [pingTimeout, setPingTimeout] = useState<number>(0);
    const [shouldColor, setShouldColor] = useState(false);
    const [isResultPlaying, setIsResultPlaying] = usePianoRollStore((state) => [
        state.isResultPlaying,
        state.setIsResultPlaying,
    ]);

    const getInlineStyles = () => {
        if (!isResultPlaying) return {};
        return {
            backgroundImage: `linear-gradient(
                                    90deg,
                                    var(--medium-primary-color) 0%,
                                    var(--medium-primary-color) ${progress}%,
                                    var(--light-primary-color) ${progress + 1}%
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

    useEffect(() => {
        (async () => {
            if (isResultPlaying) {
                await Sequencer.clearOnBeatCallbacks();
                await Sequencer.runCallbackOnBeat(() => {
                    setProgress(Sequencer.getProgress() * 100);
                });
            }
        })();
    }, [isResultPlaying]);

    const renderResult = () => {
        const sr = props.searchResult;
        if (sr === undefined) {
            return (
                <div>
                    <h4>No results yet. Try inputing some notes.</h4>
                </div>
            );
        }
        return (
            <>
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
                            onClick={() => setIsResultPlaying(!isResultPlaying)}
                        >
                            {isResultPlaying ? (
                                <BsPauseFill />
                            ) : (
                                <BsFillPlayFill />
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                addTab({
                                    ...sr,
                                    bpm: Math.round(sr.bpm),
                                    gridParams:
                                        Sequencer.getGridParamsFromNotes(
                                            sr.notes
                                        ),
                                })
                            }
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
            {props.isBusy ? (
                <div className="flex h-full flex-row items-center justify-center">
                    <ClipLoader size={24} color={WHITE} />
                    <h4 className="ml-2">Searching...</h4>
                </div>
            ) : (
                renderResult()
            )}
        </div>
    );
};

TopResult.defaultProps = {
    searchResult: undefined,
};

export default TopResult;
