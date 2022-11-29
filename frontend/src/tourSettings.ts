import { ShepherdOptionsWithType } from "react-shepherd";
import { MAX_TABS } from "./constants";

export const tourOptions = {
    defaultStepOptions: {
        classes:
            "bg-white border-2 rounded border-dark-primary outline-none text-xl p-2 w-[24rem]",
        highlightClass: "tour-highlight",
        cancelIcon: {
            enabled: true,
        },
    },
    useModalOverlay: true,
};

const buttonStyles =
    "bg-light-primary hover:bg-medium-primary rounded p-1 mt-4 hover:text-black text-white p-2 w-1/3";
const buttons = [
    {
        classes: buttonStyles,
        text: "Back",
        type: "back",
    },
    {
        classes: `${buttonStyles} float-right`,
        text: "Next",
        type: "next",
    },
];

export const steps: ShepherdOptionsWithType[] = [
    {
        id: "intro",
        buttons: [
            {
                classes: `${buttonStyles} bg-warn`,
                text: "Exit",
                type: "cancel",
            },
            {
                classes: `${buttonStyles} float-right`,
                text: "Next",
                type: "next",
            },
        ],
        scrollTo: true,
        title: "Welcome to Soarch!",
        text: [
            "Soarch is a search engine, that lets you search for songs using melodies.",
        ],
    },
    {
        id: "grid",
        attachTo: { element: "#roll-canvas", on: "auto" },
        buttons,
        scrollTo: true,
        title: "Grid",
        text: [
            "Use left mouse button to place, move and resize notes. Use right mouse button to delete them.",
        ],
    },
    {
        id: "search-result",
        attachTo: { element: "#top-result", on: "auto" },
        buttons,
        scrollTo: true,
        title: "Search results",
        text: ["After you input some notes, search results will appear here."],
    },
    {
        id: "play-button",
        attachTo: { element: "#play-button", on: "bottom" },
        buttons,
        scrollTo: true,
        title: "Play",
        text: ["You can use this button to start and stop your tune."],
    },
    {
        id: "piano-button",
        attachTo: { element: "#piano-button", on: "bottom" },
        buttons,
        scrollTo: true,
        title: "Piano",
        text: ["Use this button to open and close on-screen piano keyboard."],
    },
    {
        id: "instrument-selector-button",
        attachTo: { element: "#instrument-button", on: "bottom" },
        buttons,
        scrollTo: true,
        title: "Instrument selector",
        text: ["You can use this button to change the sound of your tune."],
    },
    {
        id: "metronome-button",
        attachTo: { element: "#metronome-button", on: "bottom" },
        buttons,
        scrollTo: true,
        title: "Metronome",
        text: ["It will help you keep a consistent tempo when recording."],
    },
    {
        id: "playback-button",
        attachTo: { element: "#playback-button", on: "bottom" },
        buttons,
        scrollTo: true,
        title: "Playback",
        text: [
            "When playback is turned on, you can hear notes that you place on the grid and play on your keyboard.",
        ],
    },
    {
        id: "bpm-input",
        attachTo: { element: "#bpm-input", on: "bottom" },
        buttons,
        scrollTo: true,
        title: "BPM",
        text: ["Use this to control the speed of your track."],
    },
    {
        id: "clear-button",
        attachTo: { element: "#clear-button", on: "bottom" },
        buttons,
        scrollTo: true,
        title: "Clear",
        text: ["This button will clear all notes from currently selected tab."],
    },
    {
        id: "export-button",
        attachTo: { element: "#export-button", on: "bottom" },
        buttons,
        scrollTo: true,
        title: "Export",
        text: ["You can export your tracks."],
    },
    {
        id: "grid-length",
        attachTo: { element: "#add-measure-button", on: "auto" },
        buttons,
        scrollTo: true,
        title: "Grid length",
        text: [
            "You can use these buttons on the sides to change the length of the grid.",
        ],
    },
    {
        id: "song-tabs",
        attachTo: { element: "#song-tabs", on: "auto" },
        buttons,
        scrollTo: true,
        title: "Song tabs",
        text: [`You can have up to ${MAX_TABS} different tabs open.`],
    },
    {
        id: "tour-button",
        attachTo: { element: "#tour-button", on: "auto" },
        buttons,
        scrollTo: true,
        title: "Restart tutorial",
        text: ["You can always restart the tutorial using this button."],
    },
    {
        id: "end",
        buttons: [
            {
                classes: buttonStyles,
                text: "Back",
                type: "back",
            },
            {
                classes: `${buttonStyles} float-right bg-warn`,
                text: "Close",
                type: "next",
            },
        ],
        scrollTo: true,
        title: "Have fun!",
        text: ["Now you know everything you need. Have fun!"],
    },
];
