import React from "react";
import { useState } from "react";
import * as Tone from "tone";
import "./App.css";
import PianoRoll from "./components/pianoRoll";
import SearchResults from "./components/searchResults";
import {
    DEFAULT_PIANO_ROLL_HEIGHT,
    DEFAULT_PIANO_ROLL_WIDTH,
} from "./constants";
import { Note } from "./sequencer";
import { API } from "./services/api";

export interface SearchResult {
    artist: string;
    name: string;
    notes: Note[];
}

function App() {
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isBusy, setBusy] = useState<boolean>(false);
    const handleSubmit = (notes: Note[], gridLength: number) => {
        setBusy(true);
        API.postNotes({
            gridLength: gridLength,
            notes: notes.map((n) => {
                return {
                    pitch: Tone.Frequency(n.pitch).toMidi(),
                    length: n.length,
                    time: n.time,
                };
            }),
        })
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
            <PianoRoll
                onSubmit={handleSubmit}
                noteHeight={DEFAULT_PIANO_ROLL_HEIGHT}
                noteWidth={DEFAULT_PIANO_ROLL_WIDTH}
            />
            <SearchResults searchResults={searchResults} isBusy={isBusy} />
        </div>
    );
}

export default App;
