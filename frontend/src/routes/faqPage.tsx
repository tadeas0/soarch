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
                                Nemeli bychom sem doplnit nejake otazky?
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>
                                Pravdepodobne ano. Pravdepodobne ano.
                                Pravdepodobne ano. Pravdepodobne ano.
                                Pravdepodobne ano. Pravdepodobne ano.
                                Pravdepodobne ano.
                            </p>
                        </AccordionItemPanel>
                    </AccordionItem>
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                Nemeli bychom sem doplnit nejake otazky?
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>
                                Pravdepodobne ano. Pravdepodobne ano.
                                Pravdepodobne ano. Pravdepodobne ano.
                                Pravdepodobne ano. Pravdepodobne ano.
                                Pravdepodobne ano.
                            </p>
                        </AccordionItemPanel>
                    </AccordionItem>
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                Nemeli bychom sem doplnit nejake otazky?
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>
                                Pravdepodobne ano. Pravdepodobne ano.
                                Pravdepodobne ano. Pravdepodobne ano.
                                Pravdepodobne ano. Pravdepodobne ano.
                                Pravdepodobne ano.
                            </p>
                        </AccordionItemPanel>
                    </AccordionItem>
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                Nemeli bychom sem doplnit nejake otazky?
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>
                                Pravdepodobne ano. Pravdepodobne ano.
                                Pravdepodobne ano. Pravdepodobne ano.
                                Pravdepodobne ano. Pravdepodobne ano.
                                Pravdepodobne ano.
                            </p>
                        </AccordionItemPanel>
                    </AccordionItem>
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                Nemeli bychom sem doplnit nejake otazky?
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>
                                Pravdepodobne ano. Pravdepodobne ano.
                                Pravdepodobne ano. Pravdepodobne ano.
                                Pravdepodobne ano. Pravdepodobne ano.
                                Pravdepodobne ano.
                            </p>
                        </AccordionItemPanel>
                    </AccordionItem>
                </Accordion>
            </main>
        </div>
    );
};

export default FaqPage;
