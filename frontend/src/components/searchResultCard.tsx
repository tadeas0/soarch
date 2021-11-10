import * as React from "react";
import { FunctionComponent, useState } from "react";
import ReactModal from "react-modal";
import { SearchResult } from "../App";
import { Sequencer } from "../sequencer";
import PianoRollGrid from "./pianoRollGrid";
import { MdClose } from "react-icons/md";
import { BsPauseFill, BsFillPlayFill } from "react-icons/bs";
import "./result.css";
import usePlayback from "../hooks/usePlayback";

interface SearchResultProps {
    searchResult: SearchResult;
}

const SearchResultCard: FunctionComponent<SearchResultProps> = ({
    searchResult,
}) => {
    const [isOpen, setOpen] = useState<boolean>(false);
    const [isPlaying, handleStart, handleStop] = usePlayback();

    const handleModalOpen = () => {
        handleStop();
        setOpen(true);
    };

    const handleModalClose = () => {
        handleStop();
        setOpen(false);
    };

    const handlePlayClick = () => {
        if (!isPlaying) {
            const params = Sequencer.getGridParamsFromNotes(searchResult.notes);
            handleStart(searchResult.notes, params.width);
        } else {
            handleStop();
        }
    };

    return (
        <div className="result-card">
            <div className="inner">
                <h4 onClick={handleModalOpen}>{searchResult.name}</h4>
                <p>{searchResult.artist}</p>
                <ReactModal
                    isOpen={isOpen}
                    shouldCloseOnOverlayClick={true}
                    className="result-overlay-content"
                    onRequestClose={handleModalClose}
                >
                    <button className="close-btn" onClick={handleModalClose}>
                        <MdClose />
                    </button>
                    <button className="play-btn" onClick={handlePlayClick}>
                        {isPlaying ? <BsPauseFill /> : <BsFillPlayFill />}
                    </button>
                    <div className="pianoroll">
                        <PianoRollGrid
                            gridParams={Sequencer.getGridParamsFromNotes(
                                searchResult.notes
                            )}
                            notes={searchResult.notes}
                        />
                    </div>
                </ReactModal>
            </div>
        </div>
    );
};

export default SearchResultCard;