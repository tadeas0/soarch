import React from "react";
import { useState, useEffect } from "react";
import * as Tone from "tone";
import Modal from "react-modal";
import "./App.css";
import PianoRoll from "./components/pianoRoll";
import { GridParams } from "./components/pianoRollGrid";
import SearchResults from "./components/searchResults";
import StrategySelector from "./components/strategySelector";
import { Option } from "./components/strategySelector";
import {
    DEFAULT_PIANO_ROLL_HEIGHT,
    DEFAULT_PIANO_ROLL_WIDTH,
    PIANO_ROLL_LOWEST_NOTE,
    DEFAULT_BPM,
} from "./constants";
import { Note } from "./sequencer";
import { API, NoteForm, Song } from "./services/api";
import { PlaybackProvider } from "./context/playbackContext";

export interface SearchResult {
    artist: string;
    name: string;
    notes: Note[];
    bpm: number;
}

Modal.setAppElement("#root");

const DEFAULT_GRID_PARAMS: GridParams = {
    height: DEFAULT_PIANO_ROLL_HEIGHT,
    width: DEFAULT_PIANO_ROLL_WIDTH,
    lowestNote: PIANO_ROLL_LOWEST_NOTE,
};

const EMPTY_QUERY: Song = {
    name: "<None>",
    artist: "<None>",
    bpm: DEFAULT_BPM,
    notes: [],
    gridParams: {
        ...DEFAULT_GRID_PARAMS,
        lowestNote: Tone.Frequency(DEFAULT_GRID_PARAMS.lowestNote).toMidi(),
    },
};

const songToOption = (query: Song) => {
    return {
        name: query.artist + " - " + query.name,
        value: query.artist + " - " + query.name,
    };
};

function App() {
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [availableStrategies, setAvailableStrategies] = useState<Option[]>(
        []
    );
    const [selectedStrategy, setSelectedStrategy] = useState<Option>();
    const [exampleQueries, setExampleQueries] = useState<Song[]>([EMPTY_QUERY]);
    const [selectedQuery, setSelectedQuery] = useState<Song>(EMPTY_QUERY);
    const [gridParams, setGridParams] =
        useState<GridParams>(DEFAULT_GRID_PARAMS);
    const [isBusy, setBusy] = useState<boolean>(false);

    useEffect(() => {
        API.getSimilarityStrategies()
            .then((res) => {
                const options = res.data.map((r) => {
                    return {
                        name: r.name,
                        value: r.shortcut,
                    };
                });
                setAvailableStrategies(options);
                setSelectedStrategy(options[0]);
            })
            .catch((err) => {
                console.log(err); // TODO: handle errors
            });
        API.getExampleQueries()
            .then((res) => {
                setExampleQueries([EMPTY_QUERY, ...res.data]);
            })
            .catch((err) => {
                console.log(err); // TODO: handle errors
            });
    }, []);

    const handleSubmit = (notes: Note[], gridLength: number) => {
        setBusy(true);
        let reqBody: NoteForm = {
            gridLength: gridLength,
            notes: notes.map((n) => {
                return {
                    pitch: Tone.Frequency(n.pitch).toMidi(),
                    length: n.length,
                    time: n.time,
                };
            }),
        };
        if (selectedStrategy)
            reqBody.similarityStrategy = selectedStrategy.value;
        API.postNotes(reqBody)
            .then((res) => {
                const result = res.data.tracks.map<SearchResult>((track) => {
                    return {
                        artist: track.artist,
                        name: track.name,
                        notes: track.notes.map<Note>((n) => {
                            return {
                                time: Tone.Time(n.time).toBarsBeatsSixteenths(),
                                pitch: Tone.Frequency(n.pitch, "midi").toNote(),
                                length: Tone.Time(
                                    n.length
                                ).toBarsBeatsSixteenths(),
                            };
                        }),
                        bpm: track.bpm,
                    };
                });
                setSearchResults(result);
                setBusy(false);
            })
            .catch((err) => {
                console.error(err); // TODO: Handle error
            });
    };

    const handleExampleQueryChange = (option: Option) => {
        const res = exampleQueries.find(
            (f) => f.artist + " - " + f.name === option.value
        );
        if (res) setSelectedQuery(res);
        if (res && res.gridParams) {
            setGridParams({
                ...res.gridParams,
                lowestNote: Tone.Frequency(
                    res.gridParams.lowestNote,
                    "midi"
                ).toNote(),
            });
        }
    };

    return (
        <div className="App">
            <PlaybackProvider>
                <PianoRoll
                    onSubmit={handleSubmit}
                    gridParams={gridParams}
                    bpm={selectedQuery.bpm}
                    notes={selectedQuery.notes.map((n) => {
                        return {
                            ...n,
                            pitch: Tone.Frequency(n.pitch, "midi").toNote(),
                        };
                    })}
                />
                <div>
                    {selectedStrategy && (
                        <StrategySelector
                            options={availableStrategies}
                            onChange={setSelectedStrategy}
                            selectedValue={selectedStrategy}
                        />
                    )}
                    <StrategySelector
                        options={exampleQueries.map(songToOption)}
                        onChange={handleExampleQueryChange}
                        selectedValue={songToOption(selectedQuery)}
                    />
                </div>
                <SearchResults searchResults={searchResults} isBusy={isBusy} />
            </PlaybackProvider>
        </div>
    );
}

export default App;
