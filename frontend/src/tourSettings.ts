import { ShepherdOptionsWithType } from "react-shepherd";

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
        attachTo: { element: "#roll-canvas" },
        buttons,
        scrollTo: true,
        title: "Grid",
        text: [
            "Use left mouse button to place, move and resize notes. Use right mouse button to delete them.",
        ],
    },
    {
        id: "record",
        attachTo: { element: "#record-button", on: "bottom" },
        buttons,
        scrollTo: true,
        title: "Recording",
        text: [
            "Use this button to record a melody using your computer keyboard or a midi controller.",
        ],
    },
    {
        id: "search-result",
        attachTo: { element: "#top-result", on: "bottom" },
        buttons,
        scrollTo: true,
        title: "Search results",
        text: ["After you input some notes, search results will appear here."],
    },
    {
        id: "tour-button",
        attachTo: { element: "#tour-button", on: "top-start" },
        buttons,
        scrollTo: true,
        title: "Restart tutorial",
        text: [
            "You can always restart the tutorial using this button with question mark in the bottom right corner.",
        ],
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
