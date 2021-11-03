import * as React from "react";
import { FunctionComponent, useState } from "react";
import ReactModal from "react-modal";
import { SearchResult } from "../App";
import { Sequencer } from "../sequencer";
import PianoRollGrid from "./pianoRollGrid";
import { MdClose } from "react-icons/md";
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
                <h4 onClick={handleModalOpen}>{searchResult.name}</h4>
                <p>{searchResult.artist}</p>
                <ReactModal
                    isOpen={isOpen}
                    shouldCloseOnOverlayClick={true}
                    className="result-overlay-content"
                    onRequestClose={handleModalClose}
                >
                    <button onClick={handleModalClose}>
                        <MdClose />
                    </button>
                    <div className="pianoroll">
                        <PianoRollGrid noteGrid={noteGrid} />
                    </div>
                </ReactModal>
            </div>
        </div>
    );
};

export default SearchResultCard;
