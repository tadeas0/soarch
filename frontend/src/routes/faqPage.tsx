import { FunctionComponent } from "react";
import {
    Accordion,
    AccordionItem,
    AccordionItemHeading,
    AccordionItemButton,
    AccordionItemPanel,
} from "react-accessible-accordion";
import "./faqPage.css";

const FaqPage: FunctionComponent = () => {
    return (
        <div className="faq-page">
            <header>
                <h1>F.A.Q.</h1>
            </header>
            <main>
                <Accordion allowMultipleExpanded allowZeroExpanded>
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                How Can I Delete A Note?
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>
                               A simple right click on the note will do the trick!
                            </p>
                        </AccordionItemPanel>
                    </AccordionItem>
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                Can I Export A Tune I Created In MIDI Song Search?
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>
                                Yes! There are numerous formats in which you can export your tune. Simply hit the export button in top button section and choose by your liking!
                            </p>
                        </AccordionItemPanel>
                    </AccordionItem>
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                How Can I Use The Piano?
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>
                                To toggle a piano, simply press a piano button in the top button section. Once you are ready, press start button to record your piano play!
                            </p>
                        </AccordionItemPanel>
                    </AccordionItem>
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                How MIDI Song Search finds best matching songs?
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>
                                Our search uses an esemble of machine learning algorithms, to find the best matches for your tune!
                            </p>
                        </AccordionItemPanel>
                    </AccordionItem>
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                Can MIDI Song Search Find Any Song?
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>
                                Currently MIDI Song Finder searches in a database containing over 8 milion songs! So there are high chances it will find the song you are looking for!
                            </p>
                        </AccordionItemPanel>
                    </AccordionItem>
                </Accordion>
            </main>
        </div>
    );
};

export default FaqPage;
