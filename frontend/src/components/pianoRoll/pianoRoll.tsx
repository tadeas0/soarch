import * as React from "react";
import { useEffect, useState, useContext, FunctionComponent } from "react";
import {
    MEASURE_LENGTH,
    MIN_BPM,
    MAX_BPM,
    DEFAULT_BPM,
    DEFAULT_PIANO_ROLL_WIDTH,
    DEFAULT_PIANO_ROLL_HEIGHT,
    PIANO_ROLL_LOWEST_NOTE,
} from "../../constants";
import { BsFillPlayFill, BsPauseFill } from "react-icons/bs";
import { MdDelete, MdOutlineSearch, MdSearchOff } from "react-icons/md";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { TiMediaRecord, TiMediaRecordOutline, TiPlus } from "react-icons/ti";
import { IoClose } from "react-icons/io5";
import usePlayback from "../../hooks/usePlayback";
import useKeyboardListener from "../../hooks/useKeyboardListener";
import { Note, Sequencer } from "../../sequencer";
import "./pianoRoll.css";
import "./tabs.css";
import PianoRollGrid from "./pianoRollGrid";
import GridParams from "../../interfaces/GridParams";
import { AvailabilityContext } from "../../context/serverAvailabilityContext";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";

interface SongParams {
    name: string;
    bpm: number;
    notes: Note[];
    gridParams: GridParams;
}

interface PianoRollProps {
    songs: {
        name?: string;
        bpm: number;
        notes?: Note[];
        gridParams: GridParams;
    }[];
    onSubmit: (notes: Note[], gridLength: number) => void;
}

const DEFAULT_SONG_PARAMS: SongParams = {
    bpm: DEFAULT_BPM,
    gridParams: {
        height: DEFAULT_PIANO_ROLL_HEIGHT,
        width: DEFAULT_PIANO_ROLL_WIDTH,
        lowestNote: PIANO_ROLL_LOWEST_NOTE,
    },
    name: "Song 1",
    notes: [],
};

const PianoRoll: FunctionComponent<PianoRollProps> = (props) => {
    const [isPlaying, handleStart, handleStop] = usePlayback();
    const { isServerAvailable } = useContext(AvailabilityContext);
    const [songs, setSongs] = useState<SongParams[]>([DEFAULT_SONG_PARAMS]);
    const [selectedSongIndex, setSelectedSongIndex] = useState(0);

    const getSelectedSong = () => songs[selectedSongIndex];

    const getGridParams = () => getSelectedSong().gridParams;

    const getNotes = () => getSelectedSong().notes;

    const updateSelectedSong = (
        updateFn: (current: SongParams) => SongParams
    ) => {
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
        if (props.songs.length <= 0) {
            setSongs([DEFAULT_SONG_PARAMS]);
        } else {
            setSongs(
                props.songs.map((s, i) => ({
                    bpm: s.bpm,
                    gridParams: s.gridParams,
                    name: s.name === undefined ? "Song " + (i + 1) : s.name,
                    notes: s.notes === undefined ? [] : s.notes,
                }))
            );
        }

        handleStop();
        // eslint-disable-next-line
    }, []);

    const handleAddNote = (note: Note) => {
        Sequencer.addNoteToBuffer(note);

        updateSelectedSong((current) => ({
            ...current,
            notes: [...current.notes, note],
        }));
    };

    const handleDeleteNote = (note: Note) => {
        Sequencer.deleteNoteFromBuffer(note);

        updateSelectedSong((current) => ({
            ...current,
            notes: current.notes.filter((n) => n !== note),
        }));
    };

    const handleClear = () => {
        updateSelectedSong((current) => ({
            ...current,
            notes: [],
        }));
        if (isPlaying) {
            handleStop();
        }
    };

    const handlePlayClick = () => {
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
    };

    const handleAddMeasure = () => {
        updateSelectedSong((current) => ({
            ...current,
            gridParams: {
                ...current.gridParams,
                width: getGridParams().width + MEASURE_LENGTH,
            },
        }));
    };

    const canRemoveMeasure = () => {
        return getGridParams().width > 2 * MEASURE_LENGTH;
    };

    const handleRemoveMeasure = () => {
        if (canRemoveMeasure()) {
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

    const handleChangeBPM = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const value = Number(e.target.value);
        e.target.value.length <= 3 &&
            updateSelectedSong((current) => ({ ...current, bpm: value }));
    };

    const handleAddSong = () => {
        const newSong = { ...DEFAULT_SONG_PARAMS };
        newSong.name = "Song " + (songs.length + 1);
        setSongs((current) => [...current, newSong]);
        setSelectedSongIndex(songs.length);
    };

    const handleCloseTab = (tabIndex: number) => {
        setSongs((current) => {
            const newSongs = [...current];
            newSongs.splice(tabIndex, 1);
            if (selectedSongIndex >= newSongs.length)
                setSelectedSongIndex(newSongs.length - 1);
            return newSongs;
        });
    };

    return (
        <div className="pianoroll">
            <div className="button-container">
                <button
                    onClick={handlePlayClick}
                    disabled={
                        !(
                            getSelectedSong().bpm >= MIN_BPM &&
                            getSelectedSong().bpm <= MAX_BPM
                        )
                    }
                >
                    {isPlaying ? <BsPauseFill /> : <BsFillPlayFill />}
                </button>
                <button
                    className="right"
                    onClick={() =>
                        getGridParams().width &&
                        props.onSubmit(getNotes(), getGridParams().width)
                    }
                    disabled={!isServerAvailable}
                >
                    {isServerAvailable ? <MdOutlineSearch /> : <MdSearchOff />}
                </button>
                <button onClick={handleClear}>
                    <MdDelete />
                </button>
                <button
                    onClick={handleRemoveMeasure}
                    disabled={!canRemoveMeasure()}
                >
                    <AiOutlineMinus />
                </button>
                <button onClick={handleAddMeasure}>
                    <AiOutlinePlus />
                </button>
                <button
                    className={playbackEnabled ? "recording" : ""}
                    onClick={() => setPlaybackEnabled(!playbackEnabled)}
                >
                    {playbackEnabled ? (
                        <TiMediaRecord />
                    ) : (
                        <TiMediaRecordOutline />
                    )}
                </button>
                <input
                    type="number"
                    value={getSelectedSong().bpm}
                    onChange={handleChangeBPM}
                    max={250}
                    min={30}
                    disabled={isPlaying}
                ></input>
            </div>
            <Tabs selectedIndex={selectedSongIndex} className="tabs">
                <TabList className="tab-list">
                    {songs.map((s, i) => (
                        <div
                            className={
                                "tab-container" +
                                (i === selectedSongIndex
                                    ? " tab-container-selected"
                                    : "")
                            }
                        >
                            <Tab
                                selectedClassName="tab-selected"
                                className="tab"
                                key={i}
                                onClick={() => setSelectedSongIndex(i)}
                            >
                                {s.name}
                            </Tab>
                            <button
                                className="close-tab-button"
                                onClick={() => handleCloseTab(i)}
                            >
                                <IoClose />
                            </button>
                        </div>
                    ))}
                    <button className="add-tab-button" onClick={handleAddSong}>
                        <TiPlus />
                    </button>
                </TabList>
                {songs.map((s, i) => (
                    <TabPanel
                        className="tab-panel"
                        selectedClassName="tab-panel-selected"
                        key={i}
                    >
                        <PianoRollGrid
                            onAddNote={handleAddNote}
                            onDeleteNote={handleDeleteNote}
                            gridParams={getGridParams()}
                            notes={s.notes}
                        />
                    </TabPanel>
                ))}
            </Tabs>
        </div>
    );
};

export default PianoRoll;
