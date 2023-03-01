import { FunctionComponent, useCallback } from "react";
import { MEASURE_LENGTH, MIN_MEASURES } from "../../constants";
import { Note } from "../../interfaces/Note";
import SongTabs from "./songTabs";
import * as React from "react";
import { TiMinus, TiPlus } from "react-icons/ti";
import { SearchResult } from "../../interfaces/SearchResult";
import {
    usePianoRollStore,
    useSelectedSong,
} from "../../stores/pianoRollStore";
import OnScreenPiano from "./onScreenPiano";
import Button from "../basic/button";
import useKeyboardListener from "../../hooks/useKeyboardListener";
import useSequencer from "../../hooks/sequencer/useSequencer";
import TopBar from "./topBar";

interface PianoRollProps {
    onShowMore: () => void;
    setIsDownloading: (v: boolean) => void;
    topSearchResult?: SearchResult;
    isFetchingResults: boolean;
    disabled?: boolean;
}

const PianoRoll: FunctionComponent<PianoRollProps> = ({
    onShowMore,
    setIsDownloading,
    disabled = false,
    isFetchingResults,
    topSearchResult,
}) => {
    const selectedSong = useSelectedSong();
    const isRecording = usePianoRollStore((state) => state.isRecording);
    const addNote = usePianoRollStore((state) => state.addNote);
    const [playbackEnabled, isPianoHidden] = usePianoRollStore((state) => [
        state.playbackEnabled,
        state.isPianoHidden,
    ]);
    const [addMeasure, removeMeasure] = usePianoRollStore((state) => [
        state.addMeasure,
        state.removeMeasure,
    ]);
    const undo = usePianoRollStore((state) => state.undo);
    const rollSequencer = useSequencer();

    const canRemoveMeasure = () =>
        selectedSong.gridParams.width > MIN_MEASURES * MEASURE_LENGTH;

    const handleKeyUp = useCallback(
        (note: Note) => {
            if (rollSequencer.isPlaying && isRecording) {
                addNote(note);
            }
        },
        [addNote, isRecording, rollSequencer.isPlaying]
    );

    const handleKeyboardDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "z" && e.ctrlKey) {
                undo();
            }
        },
        [undo]
    );

    useKeyboardListener(() => {}, handleKeyboardDown);

    return (
        <div className="flex flex-col items-center justify-start">
            <TopBar
                disabled={disabled}
                isBusy={isFetchingResults}
                onShowMore={onShowMore}
                rollSequencer={rollSequencer}
                searchResult={topSearchResult}
            />
            <div className="mt-6 flex w-full flex-row items-start justify-center gap-3 xl:justify-between">
                <Button
                    className={`mt-44 p-3 text-xl xl:block hidden${
                        canRemoveMeasure()
                            ? ""
                            : " bg-transparent text-transparent"
                    }`}
                    onClick={removeMeasure}
                    disabled={disabled || !canRemoveMeasure()}
                >
                    <TiMinus />
                </Button>
                <SongTabs
                    setIsDownloading={setIsDownloading}
                    rollSequencer={rollSequencer}
                    disabled={disabled}
                />
                <Button
                    id="add-measure-button"
                    className="mt-44 hidden p-3 text-xl xl:block"
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
                rollSequencer={rollSequencer}
            />
        </div>
    );
};

PianoRoll.defaultProps = {
    disabled: false,
    topSearchResult: undefined,
};

export default PianoRoll;
