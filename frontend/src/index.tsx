import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { AvailabilityProvider } from "./context/serverAvailabilityContext";
import reportWebVitals from "./reportWebVitals";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LandingPage from "./routes/landingPage";
import PianoRollRoute from "./routes/pianoRollRoute";
import ErrorRoute from "./routes/errorRoute";
import FaqPage from "./routes/faqPage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <LandingPage />,
        errorElement: <ErrorRoute />,
    },
    {
        path: "/pianoroll",
        element: <PianoRollRoute />,
    },
    {
        path: "/faq",
        element: <FaqPage />,
    },
]);

ReactDOM.render(
    <React.StrictMode>
        <AvailabilityProvider>
            <RouterProvider router={router} />
        </AvailabilityProvider>
    </React.StrictMode>,
    document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
