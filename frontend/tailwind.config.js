/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
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
        maxWidth: {
            "3xs": "100px",
            "2xs": "160px",
        },
        extend: {},
    },
    plugins: [],
};
