import React from "react";
import { useState, useEffect } from "react";
import "./App.css";
import PianoRoll from "./components/pianoRoll";
import { Synthesizer } from "./synthesizer";

function App() {
    const playSequence = () => {
        const a = new Synthesizer();
        a.init();
        console.log("play");
    };

    return (
        <div className="App">
            <button onClick={playSequence}>Play</button>
            <PianoRoll />
        </div>
    );
}

export default App;
