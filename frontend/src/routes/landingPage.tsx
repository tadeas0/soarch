import { FunctionComponent } from "react";
import { Link } from "react-router-dom";
import { BsArrowRight } from "react-icons/bs";
import LinkButton from "../components/basic/linkButton";

const LandingPage: FunctionComponent = () => {
    return (
        <div className="flex flex-col items-center p-6 text-black">
            <header className="mb-10 w-1/3 text-center">
                <h1 className="text-5xl font-bold tracking-wide text-light-primary">
                    SOARCH
                </h1>
            </header>
            <main className="w-1/3">
                <p className="my-3 text-xl">
                    <b>Soarch</b> is a{" "}
                    <i>
                        <b>free</b> online tool
                    </i>{" "}
                    that enables you to search songs similar to the tunes you
                    enter through our <i>web interface</i>.
                </p>
                <h3 className="mt-12 text-2xl font-semibold">
                    Do you have a melody stuck in your head and can't figure out
                    where it's from?
                </h3>
                <p className="my-3 text-lg">
                    We've got you covered. Through the use of our
                    <i>
                        {" "}
                        unique <b>state-of-the-art AI based</b> search engine
                    </i>
                    , you can discover music in a
                    <i>
                        <b> completely new way.</b>
                    </i>
                </p>
                <div className="my-20 flex justify-center">
                    <LinkButton
                        to="/pianoroll"
                        className="flex items-center justify-center py-6 px-8 text-3xl"
                    >
                        Let's do it{" "}
                        <BsArrowRight className="ml-6 mt-1" size={32} />
                    </LinkButton>
                </div>
                <div className="mt-2 border-l-4 border-light-primary p-2">
                    <p className="mb-2 text-xl font-semibold">
                        I don't know, how I could have lived without it...
                    </p>
                    <p className="text-right text-xl italic">
                        - Someone, somewhere probably
                    </p>
                </div>
            </main>
            <footer className="mt-20 flex w-1/3 justify-center">
                <Link
                    to="/faq"
                    className="py-4 px-8 text-center text-3xl text-light-primary hover:text-medium-primary"
                >
                    F.A.Q.
                </Link>
            </footer>
        </div>
    );
};

export default LandingPage;
