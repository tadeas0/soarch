import * as React from "react";
import { FunctionComponent, useState } from "react";
import ReactModal from "react-modal";
import { SearchResult } from "../App";
import { Sequencer } from "../sequencer";
import PianoRollGrid from "./pianoRollGrid";
import "./result.css";

interface SearchResultProps {
    searchResult: SearchResult;
}

const SearchResultCard: FunctionComponent<SearchResultProps> = ({
    searchResult,
}) => {
    const [isOpen, setOpen] = useState<boolean>(false);
    const [noteGrid, setNoteGrid] = useState<boolean[][]>([]);

    const handleModalOpen = () => {
        setNoteGrid(Sequencer.transformNotesToGrid(searchResult.notes));
        setOpen(true);
    };

    const handleModalClose = () => {
        setOpen(false);
    };

    return (
        <div className="result-card">
            <div className="inner">
                <h4>{searchResult.name}</h4>
                <p>{searchResult.artist}</p>
                <button onClick={handleModalOpen}>MODAL</button>
                <ReactModal
                    isOpen={isOpen}
                    shouldCloseOnOverlayClick={true}
                    className="result-overlay-content"
                    onRequestClose={handleModalClose}
                >
                    <div className="pianoroll">
                        <PianoRollGrid noteGrid={noteGrid} />
                    </div>
                </ReactModal>
            </div>
        </div>
    );
};

export default SearchResultCard;
