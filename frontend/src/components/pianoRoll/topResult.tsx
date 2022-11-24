import { FunctionComponent, useEffect, useState } from "react";
import { BsPauseFill, BsFillPlayFill } from "react-icons/bs";
import { MdModeEdit } from "react-icons/md";
import { SearchResult } from "../../App";
import {
    PianoRollActionType,
    usePianoRollDispatch,
    usePianoRollState,
} from "../../context/pianoRollContext";
import { Sequencer } from "../../sound/sequencer";
import ClipLoader from "react-spinners/ClipLoader";
import "./topResult.css";
import { PRIMARY_COLOR } from "../../constants";

interface TopResultProps {
    searchResult?: SearchResult;
    isBusy: boolean;
    onShowMore: () => void;
}

const TopResult: FunctionComponent<TopResultProps> = (props) => {
    const [progress, setProgress] = useState(0);
    const dispatch = usePianoRollDispatch();
    const state = usePianoRollState();

    const getInlineStyles = () => {
        if (!state.isResultPlaying) return {};
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
            if (state.isResultPlaying) {
                await Sequencer.clearOnBeatCallbacks();
                await Sequencer.runCallbackOnBeat(() => {
                    setProgress(Sequencer.getProgress() * 100);
                });
            }
        })();
    }, [state.isResultPlaying]);

    const renderResult = () => {
        const sr = props.searchResult;
        if (sr === undefined) {
            return (
                <div className="top-card-inner-row">
                    <div className="top-card-text">
                        <h4>No results yet. Try inputing some notes.</h4>
                    </div>
                </div>
            );
        }
        return (
            <>
                <div className="top-card-inner-row">
                    <div className="top-card-text">
                        <h4>{sr.name}</h4>
                        <p>{sr.artist}</p>
                    </div>
                    <div className="top-card-buttons">
                        <button
                            onClick={() =>
                                dispatch({
                                    type: PianoRollActionType.PLAY_RESULT,
                                })
                            }
                        >
                            {state.isResultPlaying ? (
                                <BsPauseFill />
                            ) : (
                                <BsFillPlayFill />
                            )}
                        </button>
                        <button
                            onClick={() =>
                                dispatch({
                                    type: PianoRollActionType.ADD_TAB,
                                    payload: {
                                        ...sr,
                                        gridParams:
                                            Sequencer.getGridParamsFromNotes(
                                                sr.notes
                                            ),
                                    },
                                })
                            }
                        >
                            <MdModeEdit />
                        </button>
                    </div>
                </div>
                <button onClick={props.onShowMore} className="more-button">
                    Show more results
                </button>
            </>
        );
    };

    return (
        <fieldset className="top-card" style={getInlineStyles()}>
            <legend>Best result</legend>
            {props.isBusy ? (
                <div className="top-card-spinner-container">
                    <ClipLoader
                        className="top-spinner"
                        size={24}
                        color={PRIMARY_COLOR}
                    />
                    <h4>Loading...</h4>
                </div>
            ) : (
                renderResult()
            )}
        </fieldset>
    );
};

export default TopResult;
