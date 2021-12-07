import React from "react";
import { useState, useEffect } from "react";
import * as Tone from "tone";
import Modal from "react-modal";
import "./App.css";
import PianoRoll from "./components/pianoRoll";
import SearchResults from "./components/searchResults";
import StrategySelector from "./components/strategySelector";
import { Option } from "./components/strategySelector";
import {
    DEFAULT_PIANO_ROLL_HEIGHT,
    DEFAULT_PIANO_ROLL_WIDTH,
    PIANO_ROLL_LOWEST_NOTE,
} from "./constants";
import { Note } from "./sequencer";
import { API, NoteForm } from "./services/api";
import { PlaybackProvider } from "./context/playbackContext";

export interface SearchResult {
    artist: string;
    name: string;
    notes: Note[];
    bpm: number;
}

Modal.setAppElement("#root");

function App() {
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [availableStrategies, setAvailableStrategies] = useState<Option[]>(
        []
    );
    const [selectedStrategy, setSelectedStrategy] = useState<Option>();
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

    return (
        <div className="App">
            <PlaybackProvider>
                <PianoRoll
                    onSubmit={handleSubmit}
                    noteHeight={DEFAULT_PIANO_ROLL_HEIGHT}
                    noteWidth={DEFAULT_PIANO_ROLL_WIDTH}
                    lowestNote={PIANO_ROLL_LOWEST_NOTE}
                />
                <div>
                    {selectedStrategy && (
                        <StrategySelector
                            options={availableStrategies}
                            onChange={setSelectedStrategy}
                            selectedValue={selectedStrategy}
                        />
                    )}
                </div>
                <SearchResults searchResults={searchResults} isBusy={isBusy} />
            </PlaybackProvider>
        </div>
    );
}

export default App;
