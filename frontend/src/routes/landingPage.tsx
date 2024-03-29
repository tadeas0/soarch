import { FunctionComponent } from "react";
import * as React from "react";
import { Link } from "react-router-dom";
import { BsArrowRight } from "react-icons/bs";
import LinkButton from "../components/basic/linkButton";

const LandingPage: FunctionComponent = () => (
    <div className="flex flex-col items-center p-8 text-black">
        <Link to="/" className="mb-4 self-start">
            <img
                src="/logo_text.svg"
                className="-mx-6 h-32"
                alt="soarch logo"
            />
        </Link>
        <header className="mb-10 w-full lg:w-1/2">
            <h1 className="self-start text-4xl text-light-primary">
                New way of searching for music
            </h1>
        </header>
        <main className="lg:w-1/2">
            <p className="my-3 text-xl">
                <b>Soarch</b> is a <b>free</b> online tool that enables you to
                search songs similar to the tunes you enter through our{" "}
                <i>web interface</i>.
            </p>
            <h3 className="mt-12 text-2xl font-semibold">
                Do you have a melody stuck in your head and can't figure out
                where it's from?
            </h3>
            <p className="my-3 text-xl">
                We've got you covered. Through the use of our
                <i> unique search engine</i>, you can <b>discover</b> music in a
                <i>
                    <b> completely new way.</b>
                </i>
            </p>
            <div className="my-20 flex justify-center">
                <LinkButton
                    to="/pianoroll"
                    className="flex items-center justify-center py-6 px-8 text-xl lg:text-3xl"
                >
                    Let's do it <BsArrowRight className="mt-1 ml-6" size={32} />
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

export default LandingPage;
