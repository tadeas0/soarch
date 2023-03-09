import { FunctionComponent } from "react";
import * as React from "react";
import {
    Accordion,
    AccordionItem,
    AccordionItemHeading,
    AccordionItemButton,
    AccordionItemPanel,
} from "react-accessible-accordion";
import "./faqPage.css";
import { Link } from "react-router-dom";

const FaqPage: FunctionComponent = () => (
    <div className="flex flex-col items-center p-8 text-black">
        <Link to="/" className="mb-4 self-start">
            <img
                src="/logo_text.svg"
                className="-mx-6 h-32"
                alt="soarch logo"
            />
        </Link>
        <main className="lg:w-1/2">
            <header className="mb-10 flex w-1/2 items-end justify-start self-start">
                <h1 className="ml-1 text-4xl tracking-wide text-light-primary">
                    F.A.Q.
                </h1>
            </header>
            <Accordion allowMultipleExpanded allowZeroExpanded className="p-2">
                <AccordionItem>
                    <AccordionItemHeading>
                        <AccordionItemButton>
                            How does it work?
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>
                        <p>
                            Soarch uses a combination of several algorithms to
                            extract melodies from songs and then compare them.
                        </p>
                    </AccordionItemPanel>
                </AccordionItem>
                <AccordionItem>
                    <AccordionItemHeading>
                        <AccordionItemButton>
                            Can I export a tune I created in Soarch?
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>
                        <p>
                            Yes! We currently support Ogg format, so simply hit
                            the export button in top button section to download
                            your tune!
                        </p>
                    </AccordionItemPanel>
                </AccordionItem>
                <AccordionItem>
                    <AccordionItemHeading>
                        <AccordionItemButton>
                            Can Soarch find any Song?
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>
                        <p>
                            Soarch searches in a database containing around 1
                            thousand songs. We are currently working on
                            expanding it as much as possible.
                        </p>
                    </AccordionItemPanel>
                </AccordionItem>
                <AccordionItem>
                    <AccordionItemHeading>
                        <AccordionItemButton>
                            How can I record a tune?
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>
                        <p>
                            Just press the record button and use your computer
                            keyboard or MIDI instrument to record notes.
                        </p>
                    </AccordionItemPanel>
                </AccordionItem>
                <AccordionItem>
                    <AccordionItemHeading>
                        <AccordionItemButton>
                            Does Soarch support MIDI instruments?
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>
                        <p>
                            It does! Simply connect your MIDI instrument to your
                            computer and refresh the page. Soarch will
                            automatically detect it and enable it.
                        </p>
                    </AccordionItemPanel>
                </AccordionItem>
            </Accordion>
        </main>
    </div>
);

export default FaqPage;
