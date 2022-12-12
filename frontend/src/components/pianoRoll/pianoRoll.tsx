import { useEffect, FunctionComponent, useCallback } from "react";
import { MEASURE_LENGTH, MIN_MEASURES } from "../../constants";
import { Note } from "../../interfaces/Note";
import SongTabs from "./songTabs";
import * as React from "react";
import TopButtons from "./topButtons";
import { TiMinus, TiPlus } from "react-icons/ti";
import TopResult from "./topResult";
import { SearchResult } from "../../interfaces/SearchResult";
import {
    usePianoRollStore,
    useSelectedSong,
} from "../../stores/pianoRollStore";
import OnScreenPiano from "./onScreenPiano";
import Button from "../basic/button";
import useKeyboardListener from "../../hooks/useKeyboardListener";
import useSequencer from "../../hooks/sequencer/useSequencer";
import { rollTimeToToneTime } from "../../common/coordConversion";

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
    const selectedSong = useSelectedSong();
    const { play, stop, isPlaying } = useSequencer();
    const [
        isRollPlaying,
        isResultPlaying,
        isRecording,
        setIsRollPlaying,
        setIsResultPlaying,
    ] = usePianoRollStore((state) => [
        state.isRollPlaying,
        state.isResultPlaying,
        state.isRecording,
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
        if (!isPlaying) {
            setIsResultPlaying(false);
            setIsRollPlaying(false);
        }
    }, [isPlaying, setIsResultPlaying, setIsRollPlaying]);

    useEffect(() => {
        if (hasChanged && !isFetchingResults) {
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

    const canRemoveMeasure = () =>
        selectedSong.gridParams.width > MIN_MEASURES * MEASURE_LENGTH;

    const handleKeyUp = useCallback(
        (note: Note) => {
            if (isRollPlaying && isRecording) {
                addNote(note);
            }
        },
        [addNote, isRecording, isRollPlaying]
    );

    const handleKeyboardDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === " ") {
                e.preventDefault();
                if (isResultPlaying || isRollPlaying) {
                    setIsResultPlaying(false);
                    setIsRollPlaying(false);
                    stop();
                } else {
                    setIsRollPlaying(true);
                    play(
                        selectedSong.notes,
                        selectedSong.bpm,
                        rollTimeToToneTime(selectedSong.gridParams.width)
                    );
                }
            } else if (e.key === "z" && e.ctrlKey) {
                undo();
            }
        },
        [
            isResultPlaying,
            isRollPlaying,
            play,
            selectedSong.bpm,
            selectedSong.gridParams.width,
            selectedSong.notes,
            setIsResultPlaying,
            setIsRollPlaying,
            stop,
            undo,
        ]
    );

    useKeyboardListener(() => {}, handleKeyboardDown);

    return (
        <div className="flex flex-col items-center justify-start">
            <div className="grid w-full grid-cols-11 justify-center gap-4">
                <TopResult
                    searchResult={topSearchResult}
                    isBusy={isFetchingResults}
                    onShowMore={onShowMore}
                />
                <TopButtons
                    setIsDownloading={setIsDownloading}
                    disabled={disabled}
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
