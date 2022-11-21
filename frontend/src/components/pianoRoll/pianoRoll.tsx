import {
    useEffect,
    useState,
    useImperativeHandle,
    ForwardRefRenderFunction,
    forwardRef,
} from "react";
import {
    MEASURE_LENGTH,
    MIN_BPM,
    MAX_BPM,
    DEFAULT_BPM,
    DEFAULT_PIANO_ROLL_WIDTH,
    DEFAULT_PIANO_ROLL_HEIGHT,
    PIANO_ROLL_LOWEST_NOTE,
} from "../../constants";
import usePlayback from "../../hooks/usePlayback";
import useKeyboardListener from "../../hooks/useKeyboardListener";
import { Note, Sequencer } from "../../sound/sequencer";
import "./pianoRoll.css";
import SongTabs, { SongParams } from "./songTabs";
import TopButtons from "./topButtons";

interface PianoRollProps {
    onSubmit: (notes: Note[], gridLength: number) => void;
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
    { onSubmit, disabled = false },
    ref
) => {
    const [isPlaying, handleStart, handleStop] = usePlayback();
    const [songs, setSongs] = useState<SongParams[]>([DEFAULT_SONG_PARAMS]);
    const [selectedSongIndex, setSelectedSongIndex] = useState(0);

    useImperativeHandle(ref, () => ({
        addTab(song: SongParams) {
            handleAddSong(song);
        },
    }));

    const getSelectedSong = () => songs[selectedSongIndex];

    const getGridParams = () => getSelectedSong().gridParams;

    const getNotes = () => getSelectedSong().notes;

    const updateSelectedSong = (
        updateFn: (current: SongParams) => SongParams
    ) => {
        if (!disabled)
            setSongs((current) => {
                const newSongs = [...current];
                const oldSong = newSongs[selectedSongIndex];
                const newSong = updateFn(oldSong);
                newSongs[selectedSongIndex] = newSong;
                return newSongs;
            });
    };

    const [playbackEnabled, setPlaybackEnabled] = useKeyboardListener(
        (note: Note) => {
            if (isPlaying) {
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
        setSongs([DEFAULT_SONG_PARAMS]);
        handleStop();
        // eslint-disable-next-line
    }, []);

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
            if (!isPlaying) {
                let bpm = DEFAULT_BPM;
                if (
                    getSelectedSong().bpm >= MIN_BPM &&
                    getSelectedSong().bpm <= MAX_BPM
                )
                    bpm = getSelectedSong().bpm;
                handleStart(getNotes(), bpm, getGridParams().width);
            } else {
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

    return (
        <div className="pianoroll">
            <TopButtons
                isPlaying={isPlaying}
                onAddMeasure={handleAddMeasure}
                onChangeBPM={onChangeBPM}
                onClear={handleClear}
                onPlayClick={handlePlayClick}
                onRemoveMeasure={handleRemoveMeasure}
                onSubmit={() => {
                    if (!disabled) onSubmit(getNotes(), getGridParams().width);
                }}
                playbackEnabled={playbackEnabled}
                selectedSong={getSelectedSong()}
                togglePlayback={() => setPlaybackEnabled(!playbackEnabled)}
                disabled={disabled}
            />
            <SongTabs
                onAddNote={handleAddNote}
                onDeleteNote={handleDeleteNote}
                onAddTab={handleAddSong}
                onCloseTab={handleCloseTab}
                onChangeIndex={setSelectedSongIndex}
                selectedSongIndex={selectedSongIndex}
                songs={songs}
                disabled={disabled}
            />
        </div>
    );
};

export default forwardRef(PianoRoll);
