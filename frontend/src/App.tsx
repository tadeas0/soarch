import React from "react";
import { useState } from "react";
import * as Tone from "tone";
import "./App.css";
import PianoRoll from "./components/pianoRoll";
import SearchResultCard from "./components/result";
import { Note } from "./sequencer";
import { API } from "./services/api";

export interface SearchResult {
    artist: string;
    name: string;
    notes: Note[];
}

function App() {
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const handleSubmit = (notes: Note[], gridLength: number) => {
        API.postNotes({
            gridLength: gridLength,
            notes: notes.map((n) => {
                return {
                    pitch: Tone.Frequency(n.pitch).toMidi(),
                    length: n.length,
                    time: n.time,
                };
            }),
        }).then((res) => {
            const result = res.data.tracks.map<SearchResult>((track) => {
                return {
                    artist: track.artist,
                    name: track.name,
                    notes: track.notes.map<Note>((n) => {
                        return {
                            time: Tone.Time(n.time).toBarsBeatsSixteenths(),
                            pitch: Tone.Frequency(n.pitch, "midi").toNote(),
                            length: Tone.Time(n.length).toBarsBeatsSixteenths(),
                        };
                    }),
                };
            });
            setSearchResults(result);
        });
    };

    return (
        <div className="App">
            <PianoRoll onSubmit={handleSubmit} />
            {searchResults.map((s) => (
                <SearchResultCard searchResult={s} />
            ))}
        </div>
    );
}

export default App;
