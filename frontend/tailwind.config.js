/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    future: {
        hoverOnlyWhenSupported: true,
    },
    theme: {
        colors: {
            background: "#f2e8cfff",
            "light-primary": "#477998ff",
            "medium-primary": "#9c7a97ff",
            "dark-primary": "#1e152aff",
            warn: "#b24c63ff",
            white: "#e5e5db",
            black: "#2e3436",
            transparent: "transparent",
        },
        fontFamily: {
            logo: "Latin Modern Mono Light",
        },
        extend: {
            maxWidth: {
                "3xs": "100px",
                "2xs": "160px",
            },
        },
    },
    plugins: [require("@tailwindcss/forms")],
};
