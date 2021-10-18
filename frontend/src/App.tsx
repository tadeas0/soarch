import React from "react";
import * as Tone from "tone";
import "./App.css";
import PianoRoll from "./components/pianoRoll";
import { Note } from "./sequencer";
import { API } from "./services/api";

function App() {
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
        }).then((res) => console.log(res.data));
    };

    return (
        <div className="App">
            <PianoRoll onSubmit={handleSubmit} />
        </div>
    );
}

export default App;
