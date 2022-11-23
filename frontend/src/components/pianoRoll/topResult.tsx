import { FunctionComponent, useEffect, useState } from "react";
import { BsPauseFill, BsFillPlayFill } from "react-icons/bs";
import { MdModeEdit } from "react-icons/md";
import { SearchResult } from "../../App";
import { Sequencer } from "../../sound/sequencer";
import "./topResult.css";

interface TopResultProps {
    searchResult?: SearchResult;
    isBusy: boolean;
    onShowMore: () => void;
    isPlaying: boolean;
    onPlayClick?: (searchResult: SearchResult) => void;
    onEdit: (searchResult: SearchResult) => void;
}

const TopResult: FunctionComponent<TopResultProps> = (props) => {
    const [progress, setProgress] = useState(0);

    const getInlineStyles = () => {
        if (!props.isPlaying) return {};
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
            if (props.isPlaying) {
                await Sequencer.clearOnBeatCallbacks();
                await Sequencer.runCallbackOnBeat(() => {
                    setProgress(Sequencer.getProgress() * 100);
                });
            }
        })();
    }, [props.isPlaying]);

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
                            onClick={() => {
                                if (props.onPlayClick) props.onPlayClick(sr);
                            }}
                        >
                            {props.isPlaying ? (
                                <BsPauseFill />
                            ) : (
                                <BsFillPlayFill />
                            )}
                        </button>
                        <button onClick={() => props.onEdit(sr)}>
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
            {props.isBusy ? <p>Loading</p> : renderResult()}
        </fieldset>
    );
};

export default TopResult;
