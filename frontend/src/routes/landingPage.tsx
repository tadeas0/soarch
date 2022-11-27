import { FunctionComponent } from "react";
import { GrLinkNext } from "react-icons/gr";
import { Link } from "react-router-dom";
import "./landingPage.css";

const LandingPage: FunctionComponent = () => {
    return (
        <div className="landing-page">
            <header>
                <h1>MIDI Song Finder</h1>
            </header>
            <main>
                <p>
                    MIDI Song Finder is a free online tool that enables musicians
                    to search similar songs to the tunes they enter through our 
                    online midi controller. 
                </p>    
                <p>    Feel free to experiment and use Midi
                    Song Finder as your digital playground!

                </p>
                <Link to="/pianoroll" className="roll-button">
                    <GrLinkNext />
                </Link>
            </main>
            <footer>
                <Link className="footer-button" to="/faq">
                    F.A.Q.
                </Link>
            </footer>
        </div>
    );
};

export default LandingPage;
