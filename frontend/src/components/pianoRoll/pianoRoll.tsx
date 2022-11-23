import {
    useEffect,
    useImperativeHandle,
    ForwardRefRenderFunction,
    forwardRef,
    useCallback,
} from "react";
import { MEASURE_LENGTH, MIN_NOTES_FOR_FETCHING } from "../../constants";
import { Note } from "../../sound/sequencer";
import "./pianoRoll.css";
import SongTabs, { SongParams } from "./songTabs";
import TopButtons from "./topButtons";
import { TiMinus, TiPlus } from "react-icons/ti";
import TopResult from "./topResult";
import { SearchResult } from "../../App";
import {
    PianoRollActionType,
    usePianoRollDispatch,
    usePianoRollState,
} from "../../context/pianoRollContext";

interface PianoRollProps {
    onSubmit: (notes: Note[], gridLength: number) => void;
    onShowMore: () => void;
    topSearchResult?: SearchResult;
    isFetchingResults: boolean;
    disabled?: boolean;
}

export interface PianoRollHandle {
    addTab: (song: SongParams) => void;
}

const PianoRoll: ForwardRefRenderFunction<PianoRollHandle, PianoRollProps> = (
    {
        onSubmit,
        onShowMore,
        disabled = false,
        isFetchingResults,
        topSearchResult,
    },
    ref
) => {
    const state = usePianoRollState();
    const dispatch = usePianoRollDispatch();

    const getSelectedSong = useCallback(
        () => state.songs[state.selectedIndex],
        [state.selectedIndex, state.songs]
    );

    const getGridParams = useCallback(
        () => getSelectedSong().gridParams,
        [getSelectedSong]
    );

    const getNotes = useCallback(
        () => getSelectedSong().notes,
        [getSelectedSong]
    );

    useImperativeHandle(ref, () => ({
        addTab(song: SongParams) {
            dispatch({ type: PianoRollActionType.ADD_TAB, payload: song });
        },
    }));

    useEffect(() => {
        if (
            state.hasChanged &&
            !isFetchingResults &&
            getNotes().length > MIN_NOTES_FOR_FETCHING
        ) {
            onSubmit(getNotes(), getGridParams().width);
        }
        dispatch({ type: PianoRollActionType.CLEAR_HAS_CHANGED_FLAG });
    }, [
        dispatch,
        getGridParams,
        getNotes,
        isFetchingResults,
        onSubmit,
        state.hasChanged,
    ]);

    const canRemoveMeasure = () => {
        return (
            state.songs[state.selectedIndex].gridParams.width >
            2 * MEASURE_LENGTH
        );
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
                    onClick={() =>
                        dispatch({ type: PianoRollActionType.REMOVE_MEASURE })
                    }
                    disabled={disabled || !canRemoveMeasure()}
                >
                    <TiMinus />
                </button>
                <SongTabs
                    disabledHeader={disabled || state.isResultPlaying}
                    disabled={disabled}
                />
                <button
                    className="grid-button"
                    onClick={() =>
                        dispatch({ type: PianoRollActionType.ADD_MEASURE })
                    }
                    disabled={disabled}
                >
                    <TiPlus />
                </button>
            </div>
        </div>
    );
};

export default forwardRef(PianoRoll);
