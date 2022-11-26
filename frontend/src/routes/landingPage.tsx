import { FunctionComponent } from "react";
import { GrLinkNext } from "react-icons/gr";
import { Link } from "react-router-dom";

const LandingPage: FunctionComponent = () => {
    return (
        <div className="landing-page">
            <header>
                <h1>Song search idk</h1>
            </header>
            <main>
                <p>
                    Sem by to chtelo doplnit nejaky popis. Sem by to chtelo
                    doplnit nejaky popis. Sem by to chtelo doplnit nejaky popis.
                    Sem by to chtelo doplnit nejaky popis. Sem by to chtelo
                    doplnit nejaky popis. Sem by to chtelo doplnit nejaky popis.
                    Sem by to chtelo doplnit nejaky popis. Sem by to chtelo
                    doplnit nejaky popis.
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
