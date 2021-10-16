import React from "react";
import "./App.css";
import PianoRoll from "./components/pianoRoll";
import { Note } from "./sequencer";

function App() {
    const handleSubmit = (notes: Note[]) => {
        console.log(notes);
    };

    return (
        <div className="App">
            <PianoRoll onSubmit={handleSubmit} />
        </div>
    );
}

export default App;
