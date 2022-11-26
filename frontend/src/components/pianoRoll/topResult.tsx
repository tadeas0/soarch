import { FunctionComponent, useEffect, useState } from "react";
import { BsPauseFill, BsFillPlayFill } from "react-icons/bs";
import { MdModeEdit } from "react-icons/md";
import { SearchResult } from "../../routes/pianoRollRoute";
import { Sequencer } from "../../sound/sequencer";
import ClipLoader from "react-spinners/ClipLoader";
import { usePianoRollStore, useTabControls } from "../../stores/pianoRollStore";

interface TopResultProps {
    searchResult?: SearchResult;
    isBusy: boolean;
    onShowMore: () => void;
}

const TopResult: FunctionComponent<TopResultProps> = (props) => {
    const [progress, setProgress] = useState(0);
    const { canAddTab, addTab } = useTabControls();
    const [isResultPlaying, setIsResultPlaying] = usePianoRollStore((state) => [
        state.isResultPlaying,
        state.setIsResultPlaying,
    ]);

    const getInlineStyles = () => {
        if (!isResultPlaying) return {};
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
                    <div className="w-5/6">
                        <h4 className="text-xl">{sr.name}</h4>
                        <p className="text-sm">{sr.artist}</p>
                    </div>
                    <div className="flex h-full w-1/6 flex-col justify-evenly">
                        <button
                            className="text-xl"
                            onClick={() => setIsResultPlaying(!isResultPlaying)}
                        >
                            {isResultPlaying ? (
                                <BsPauseFill />
                            ) : (
                                <BsFillPlayFill />
                            )}
                        </button>
                        <button
                            onClick={() =>
                                addTab({
                                    ...sr,
                                    gridParams:
                                        Sequencer.getGridParamsFromNotes(
                                            sr.notes
                                        ),
                                })
                            }
                            className={"text-xl" + canAddTab ? "" : " inactive"}
                        >
                            <MdModeEdit />
                        </button>
                    </div>
                </div>
                <button
                    onClick={props.onShowMore}
                    className="w-full pr-2 text-right underline"
                >
                    Show more results
                </button>
            </>
        );
    };

    return (
        <div
            className="col-span-2 h-28 rounded bg-light-primary p-1 pb-2 text-white"
            style={getInlineStyles()}
        >
            {props.isBusy ? (
                <div className="flex h-full flex-row items-center justify-center">
                    <ClipLoader size={24} />
                    <h4 className="ml-2">Loading...</h4>
                </div>
            ) : (
                renderResult()
            )}
        </div>
    );
};

export default TopResult;
