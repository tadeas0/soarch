import { useEffect, FunctionComponent, useCallback } from "react";
import {
    MEASURE_LENGTH,
    MIN_MEASURES,
    MIN_NOTES_FOR_FETCHING,
} from "../../constants";
import { Note, Sequencer } from "../../sound/sequencer";
import SongTabs from "./songTabs";
import * as React from "react";
import TopButtons from "./topButtons";
import { TiMinus, TiPlus } from "react-icons/ti";
import TopResult from "./topResult";
import { SearchResult } from "../../interfaces/SearchResult";
import usePlayback from "../../hooks/usePlayback";
import {
    usePianoRollStore,
    useSelectedSong,
} from "../../stores/pianoRollStore";
import OnScreenPiano from "./onScreenPiano";
import Button from "../basic/button";
import useKeyboardListener from "../../hooks/useKeyboardListener";

interface PianoRollProps {
    onSubmit: (notes: Note[], gridLength: number) => void;
    onShowMore: () => void;
    setIsDownloading: (v: boolean) => void;
    topSearchResult?: SearchResult;
    isFetchingResults: boolean;
    disabled?: boolean;
}

const PianoRoll: FunctionComponent<PianoRollProps> = ({
    onSubmit,
    onShowMore,
    setIsDownloading,
    disabled = false,
    isFetchingResults,
    topSearchResult,
}) => {
    const [, handleStart, handleStop] = usePlayback();
    const selectedSong = useSelectedSong();
    const [
        isRollPlaying,
        isResultPlaying,
        setIsRollPlaying,
        setIsResultPlaying,
    ] = usePianoRollStore((state) => [
        state.isRollPlaying,
        state.isResultPlaying,
        state.setIsRollPlaying,
        state.setIsResultPlaying,
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
    const undo = usePianoRollStore((state) => state.undo);

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

    const canRemoveMeasure = () =>
        selectedSong.gridParams.width > MIN_MEASURES * MEASURE_LENGTH;

    const handleKeyUp = useCallback(
        (note: Note) => {
            if (isRollPlaying) {
                Sequencer.fillBuffer([note], selectedSong.gridParams.width);
                addNote(note);
            }
        },
        [addNote, isRollPlaying, selectedSong.gridParams.width]
    );

    const handleKeyboardDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === " ") {
                e.preventDefault();
                if (isResultPlaying || isRollPlaying) {
                    setIsResultPlaying(false);
                    setIsRollPlaying(false);
                    handleStop();
                } else {
                    setIsRollPlaying(true);
                    handleStart(
                        selectedSong.notes,
                        selectedSong.bpm,
                        selectedSong.gridParams.width
                    );
                }
            } else if (e.key === "z" && e.ctrlKey) {
                undo();
            }
        },
        [
            handleStart,
            handleStop,
            isResultPlaying,
            isRollPlaying,
            selectedSong.bpm,
            selectedSong.gridParams.width,
            selectedSong.notes,
            setIsResultPlaying,
            setIsRollPlaying,
            undo,
        ]
    );

    useKeyboardListener(() => {}, handleKeyboardDown);

    return (
        <div className="flex flex-col items-center justify-start">
            <div className="grid w-full grid-cols-12 justify-center gap-4">
                <TopButtons
                    setIsDownloading={setIsDownloading}
                    disabled={disabled}
                />
                <TopResult
                    searchResult={topSearchResult}
                    isBusy={isFetchingResults}
                    onShowMore={onShowMore}
                />
            </div>
            <div className="mt-10 flex w-full flex-row items-start justify-between gap-3">
                <Button
                    className={`mt-44 p-3 text-xl${
                        canRemoveMeasure()
                            ? ""
                            : " bg-transparent text-transparent"
                    }`}
                    onClick={removeMeasure}
                    disabled={disabled || !canRemoveMeasure()}
                >
                    <TiMinus />
                </Button>
                <SongTabs disabled={disabled} />
                <Button
                    id="add-measure-button"
                    className="mt-44 p-3 text-xl"
                    onClick={addMeasure}
                    disabled={disabled}
                >
                    <TiPlus />
                </Button>
            </div>
            <OnScreenPiano
                onKeyUp={handleKeyUp}
                hidden={isPianoHidden}
                playbackEnabled={playbackEnabled}
            />
        </div>
    );
};

PianoRoll.defaultProps = {
    disabled: false,
    topSearchResult: undefined,
};

export default PianoRoll;
