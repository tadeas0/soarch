import {
    useEffect,
    useState,
    useImperativeHandle,
    ForwardRefRenderFunction,
    forwardRef,
    useCallback,
} from "react";
import {
    MEASURE_LENGTH,
    MIN_BPM,
    MAX_BPM,
    DEFAULT_BPM,
    DEFAULT_PIANO_ROLL_WIDTH,
    DEFAULT_PIANO_ROLL_HEIGHT,
    PIANO_ROLL_LOWEST_NOTE,
    MIN_NOTES_FOR_FETCHING,
} from "../../constants";
import usePlayback from "../../hooks/usePlayback";
import useKeyboardListener from "../../hooks/useKeyboardListener";
import { Note, Sequencer } from "../../sound/sequencer";
import "./pianoRoll.css";
import SongTabs, { SongParams } from "./songTabs";
import TopButtons from "./topButtons";
import { TiMinus, TiPlus } from "react-icons/ti";
import TopResult from "./topResult";
import { SearchResult } from "../../App";

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

export const DEFAULT_SONG_PARAMS: SongParams = {
    bpm: DEFAULT_BPM,
    gridParams: {
        height: DEFAULT_PIANO_ROLL_HEIGHT,
        width: DEFAULT_PIANO_ROLL_WIDTH,
        lowestNote: PIANO_ROLL_LOWEST_NOTE,
    },
    name: "Song 1",
    notes: [],
};

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
    const [isPlaying, handleStart, handleStop] = usePlayback();
    const [songs, setSongs] = useState<SongParams[]>([DEFAULT_SONG_PARAMS]);
    const [selectedSongIndex, setSelectedSongIndex] = useState(0);
    const [hasChanged, setHasChanged] = useState(false);
    const [isRollPlaying, setIsRollPlaying] = useState(false);
    const [isResultPlaying, setIsResultPlaying] = useState(false);

    useImperativeHandle(ref, () => ({
        addTab(song: SongParams) {
            handleAddSong(song);
        },
    }));

    const getSelectedSong = useCallback(
        () => songs[selectedSongIndex],
        [selectedSongIndex, songs]
    );

    const getGridParams = useCallback(
        () => getSelectedSong().gridParams,
        [getSelectedSong]
    );

    const getNotes = useCallback(
        () => getSelectedSong().notes,
        [getSelectedSong]
    );

    const updateSelectedSong = (
        updateFn: (current: SongParams) => SongParams
    ) => {
        if (!disabled) {
            setSongs((current) => {
                const newSongs = [...current];
                const oldSong = newSongs[selectedSongIndex];
                const newSong = updateFn(oldSong);
                newSongs[selectedSongIndex] = newSong;
                return newSongs;
            });
            setHasChanged(true);
        }
    };

    const [playbackEnabled, setPlaybackEnabled] = useKeyboardListener(
        (note: Note) => {
            if (isRollPlaying) {
                const newNotes = [...getNotes(), note];
                Sequencer.fillBuffer([note], getGridParams().width);
                updateSelectedSong((current) => ({
                    ...current,
                    notes: newNotes,
                }));
            }
        },
        getGridParams().lowestNote
    );

    useEffect(() => {
        if (
            hasChanged &&
            !isFetchingResults &&
            getNotes().length > MIN_NOTES_FOR_FETCHING
        ) {
            onSubmit(getNotes(), getGridParams().width);
        }
        setHasChanged(false);
    }, [getGridParams, getNotes, hasChanged, isFetchingResults, onSubmit]);

    const handleAddNote = (note: Note) => {
        if (!disabled) {
            Sequencer.addNoteToBuffer(note);

            updateSelectedSong((current) => ({
                ...current,
                notes: [...current.notes, note],
            }));
        }
    };

    const handleDeleteNote = (note: Note) => {
        if (!disabled) {
            Sequencer.deleteNoteFromBuffer(note);

            updateSelectedSong((current) => ({
                ...current,
                notes: current.notes.filter((n) => n !== note),
            }));
        }
    };

    const handleClear = () => {
        if (!disabled) {
            updateSelectedSong((current) => ({
                ...current,
                notes: [],
            }));
            if (isPlaying) {
                handleStop();
            }
        }
    };

    const handlePlayClick = () => {
        if (!disabled) {
            if (!isRollPlaying) {
                let bpm = DEFAULT_BPM;
                if (
                    getSelectedSong().bpm >= MIN_BPM &&
                    getSelectedSong().bpm <= MAX_BPM
                )
                    bpm = getSelectedSong().bpm;
                stopResult();
                setIsRollPlaying(true);
                handleStart(getNotes(), bpm, getGridParams().width);
            } else {
                stopResult();
                setIsRollPlaying(false);
                handleStop();
            }
        }
    };

    const handleAddMeasure = () => {
        if (!disabled) {
            updateSelectedSong((current) => ({
                ...current,
                gridParams: {
                    ...current.gridParams,
                    width: getGridParams().width + MEASURE_LENGTH,
                },
            }));
        }
    };

    const canRemoveMeasure = () => {
        return getGridParams().width > 2 * MEASURE_LENGTH;
    };

    const handleRemoveMeasure = () => {
        if (canRemoveMeasure() && !disabled) {
            const newGridLength = getGridParams().width - MEASURE_LENGTH;
            const newNotes = getNotes().filter((n) => {
                return (
                    Sequencer.toneTimeToRollTime(n.time) +
                        Sequencer.toneTimeToRollTime(n.length) <
                    newGridLength
                );
            });
            updateSelectedSong((current) => ({
                ...current,
                gridParams: { ...current.gridParams, width: newGridLength },
                notes: newNotes,
            }));
            handleStop();
        }
    };

    const onChangeBPM = (newBMP: number) => {
        if (!disabled)
            updateSelectedSong((current) => ({ ...current, bpm: newBMP }));
    };

    const handleAddSong = (song?: SongParams) => {
        handleStop();
        let newSong: SongParams;
        if (song === undefined) {
            newSong = { ...DEFAULT_SONG_PARAMS };
            newSong.name = "Song " + (songs.length + 1);
        } else {
            newSong = { ...song };
        }
        setSongs((current) => [...current, newSong]);
        setSelectedSongIndex(songs.length);
    };

    const handleCloseTab = (tabIndex: number) => {
        if (songs.length > 1 && !disabled) {
            setSongs((current) => {
                const newSongs = [...current];
                newSongs.splice(tabIndex, 1);
                if (selectedSongIndex >= newSongs.length)
                    setSelectedSongIndex(newSongs.length - 1);
                return newSongs;
            });
        }
    };

    const handleEdit = (searchResult: SearchResult) => {
        const s: SongParams = {
            bpm: searchResult.bpm,
            gridParams: Sequencer.getGridParamsFromNotes(searchResult.notes),
            name: searchResult.name,
            notes: searchResult.notes,
        };
        handleAddSong(s);
    };

    const stopResult = () => {
        handleStop();
        setIsResultPlaying(false);
    };

    const startResult = (searchResult: SearchResult) => {
        handleStop();
        setIsRollPlaying(false);
        const gp = Sequencer.getGridParamsFromNotes(searchResult.notes);
        handleStart(searchResult.notes, searchResult.bpm, gp.width);
        setIsResultPlaying(true);
    };

    const handleResultPlay = (searchResult: SearchResult) => {
        if (!isResultPlaying) {
            startResult(searchResult);
        } else {
            stopResult();
        }
    };

    return (
        <div className="pianoroll">
            <div className="top-bar">
                <TopButtons
                    isPlaying={isRollPlaying}
                    onChangeBPM={onChangeBPM}
                    onClear={handleClear}
                    onPlayClick={handlePlayClick}
                    onPlaybackClick={() =>
                        setPlaybackEnabled((current) => !current)
                    }
                    playbackEnabled={playbackEnabled}
                    selectedSong={getSelectedSong()}
                    disabled={disabled}
                />
                <TopResult
                    isBusy={isFetchingResults}
                    onEdit={handleEdit}
                    isPlaying={isResultPlaying}
                    onPlayClick={handleResultPlay}
                    searchResult={topSearchResult}
                    onShowMore={onShowMore}
                />
            </div>
            <div className="roll-row-container">
                <button
                    className="grid-button"
                    onClick={handleRemoveMeasure}
                    disabled={disabled || !canRemoveMeasure()}
                >
                    <TiMinus />
                </button>
                <SongTabs
                    onAddNote={handleAddNote}
                    onDeleteNote={handleDeleteNote}
                    onAddTab={handleAddSong}
                    onCloseTab={handleCloseTab}
                    onChangeIndex={setSelectedSongIndex}
                    selectedSongIndex={selectedSongIndex}
                    playbackEnabled={playbackEnabled}
                    songs={songs}
                    disabledHeader={disabled || isResultPlaying}
                    disabled={disabled}
                />
                <button
                    className="grid-button"
                    onClick={handleAddMeasure}
                    disabled={disabled}
                >
                    <TiPlus />
                </button>
            </div>
        </div>
    );
};

export default forwardRef(PianoRoll);
