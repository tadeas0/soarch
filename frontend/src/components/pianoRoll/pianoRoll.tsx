import { useEffect, FunctionComponent } from "react";
import { MEASURE_LENGTH, MIN_NOTES_FOR_FETCHING } from "../../constants";
import { Note, Sequencer } from "../../sound/sequencer";
import "./pianoRoll.css";
import SongTabs from "./songTabs";
import TopButtons from "./topButtons";
import { TiMinus, TiPlus } from "react-icons/ti";
import TopResult from "./topResult";
import { SearchResult } from "../../App";
import usePlayback from "../../hooks/usePlayback";
import {
    usePianoRollStore,
    useSelectedSong,
} from "../../stores/pianoRollStore";
import OnScreenPiano from "./onScreenPiano";

interface PianoRollProps {
    onSubmit: (notes: Note[], gridLength: number) => void;
    onShowMore: () => void;
    topSearchResult?: SearchResult;
    isFetchingResults: boolean;
    disabled?: boolean;
}

const PianoRoll: FunctionComponent<PianoRollProps> = ({
    onSubmit,
    onShowMore,
    disabled = false,
    isFetchingResults,
    topSearchResult,
}) => {
    const [, handleStart, handleStop] = usePlayback();
    const selectedSong = useSelectedSong();
    const [isRollPlaying, isResultPlaying] = usePianoRollStore((state) => [
        state.isRollPlaying,
        state.isResultPlaying,
    ]);
    const addNote = usePianoRollStore((state) => state.addNote);
    const [playbackEnabled, isPianoHidden] = usePianoRollStore((state) => [
        state.playbackEnabled,
        state.isPianoHidden,
    ]);
    const [hasChanged, clearChangeFlag] = usePianoRollStore((state) => [
        state.hasChanged,
        state.clearChangeFlag,
    ]);
    const [addMeasure, removeMeasure] = usePianoRollStore((state) => [
        state.addMeasure,
        state.removeMeasure,
    ]);

    useEffect(() => {
        if (
            hasChanged &&
            !isFetchingResults &&
            selectedSong.notes.length > MIN_NOTES_FOR_FETCHING
        ) {
            onSubmit(selectedSong.notes, selectedSong.gridParams.width);
        }
        clearChangeFlag();
    }, [
        clearChangeFlag,
        hasChanged,
        isFetchingResults,
        onSubmit,
        selectedSong.gridParams.width,
        selectedSong.notes,
    ]);

    useEffect(() => {
        if (isResultPlaying && topSearchResult) {
            handleStart(
                topSearchResult.notes,
                topSearchResult.bpm,
                Sequencer.getGridParamsFromNotes(topSearchResult.notes).width
            );
        } else if (isRollPlaying) {
            const s = selectedSong;
            handleStart(s.notes, s.bpm, s.gridParams.width);
        } else {
            handleStop();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isResultPlaying, isRollPlaying, selectedSong]);

    const canRemoveMeasure = () => {
        return selectedSong.gridParams.width > 2 * MEASURE_LENGTH;
    };

    const handleKeyUp = (note: Note) => {
        if (isRollPlaying) {
            Sequencer.fillBuffer([note], selectedSong.gridParams.width);
            addNote(note);
        }
    };

    return (
        <div className="pianoroll">
            <div className="top-bar">
                <TopButtons disabled={disabled} />
                <TopResult
                    searchResult={topSearchResult}
                    isBusy={isFetchingResults}
                    onShowMore={onShowMore}
                />
            </div>
            <div className="roll-row-container">
                <button
                    className="grid-button"
                    onClick={removeMeasure}
                    disabled={disabled || !canRemoveMeasure()}
                >
                    <TiMinus />
                </button>
                <SongTabs
                    disabledHeader={disabled || isResultPlaying}
                    disabled={disabled}
                />
                <button
                    className="grid-button"
                    onClick={addMeasure}
                    disabled={disabled}
                >
                    <TiPlus />
                </button>
            </div>
            <OnScreenPiano
                onKeyUp={handleKeyUp}
                hidden={isPianoHidden}
                playbackEnabled={playbackEnabled}
            />
        </div>
    );
};

export default PianoRoll;
