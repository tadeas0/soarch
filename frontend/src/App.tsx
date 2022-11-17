import React, { useContext } from "react";
import { useState, useEffect, useCallback } from "react";
import * as Tone from "tone";
import Modal from "react-modal";
import "./App.css";
import PianoRoll from "./components/pianoRoll/pianoRoll";
import GridParams from "./interfaces/GridParams";
import SearchResults from "./components/searchResults";
import StrategySelector from "./components/strategySelector";
import { Option } from "./components/strategySelector";
import {
    DEFAULT_PIANO_ROLL_HEIGHT,
    DEFAULT_PIANO_ROLL_WIDTH,
    PIANO_ROLL_LOWEST_NOTE,
    DEFAULT_BPM,
    SECONDARY_COLOR,
} from "./constants";
import { Note } from "./sequencer";
import { API, NoteForm, Song } from "./services/api";
import { PlaybackProvider } from "./context/playbackContext";
import { BeatLoader } from "react-spinners";
import { AvailabilityContext } from "./context/serverAvailabilityContext";

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

function App() {
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [availableStrategies, setAvailableStrategies] = useState<Option[]>(
        []
    );
    const [selectedStrategy, setSelectedStrategy] = useState<Option>();
    const [exampleQueries, setExampleQueries] = useState<Song[]>([EMPTY_QUERY]);
    const [selectedQuery, setSelectedQuery] = useState<Song>();
    const [, setGridParams] = useState<GridParams>(DEFAULT_GRID_PARAMS);
    const [isBusy, setBusy] = useState<boolean>(false);
    const [initializing, setInitializing] = useState(false);
    const { setServerAvailable } = useContext(AvailabilityContext);

    const handleRequestErrors = useCallback(
        (err: any) => {
            if (err.response) {
                if (err.response.status === 500) {
                    setServerAvailable(false);
                } else {
                    console.log(err);
                }
            } else {
                console.log(err);
            }
        },
        [setServerAvailable]
    );

    useEffect(() => {
        setInitializing(true);
        Promise.all([API.getSimilarityStrategies(), API.getExampleQueries()])
            .then(([resSimStrat, resExamQ]) => {
                const options = resSimStrat.data.map((r) => {
                    return {
                        name: r.name,
                        value: r.shortcut,
                    };
                });
                setAvailableStrategies(options);
                setSelectedStrategy(options[0]);
                setExampleQueries([EMPTY_QUERY, ...resExamQ.data]);
                setServerAvailable(true);
            })
            .catch(handleRequestErrors)
            .finally(() => setInitializing(false));
    }, [setServerAvailable, handleRequestErrors]);

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
            })
            .catch(handleRequestErrors)
            .finally(() => setBusy(false));
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

    const getQueryOptions = () => {
        return exampleQueries.map((query) => {
            return {
                name: query.artist + " - " + query.name,
                value: query.artist + " - " + query.name,
            };
        });
    };

    const getSelectedQueryOption = () => {
        if (selectedQuery)
            return {
                name: selectedQuery.artist + " - " + selectedQuery.name,
                value: selectedQuery.artist + " - " + selectedQuery.name,
            };
        return undefined;
    };

    return (
        <div className="App">
            {initializing ? (
                <div>
                    <BeatLoader size={100} color={SECONDARY_COLOR} />
                    <h1>Connecting to the server...</h1>
                </div>
            ) : (
                <PlaybackProvider>
                    <PianoRoll onSubmit={handleSubmit} songs={[]} />
                    <div>
                        {selectedStrategy && (
                            <StrategySelector
                                options={availableStrategies}
                                onChange={setSelectedStrategy}
                                selectedValue={selectedStrategy}
                            />
                        )}
                        <StrategySelector
                            options={getQueryOptions()}
                            onChange={handleExampleQueryChange}
                            selectedValue={getSelectedQueryOption()}
                        />
                    </div>
                    <SearchResults
                        searchResults={searchResults}
                        isBusy={isBusy}
                    />
                </PlaybackProvider>
            )}
        </div>
    );
}

export default App;
