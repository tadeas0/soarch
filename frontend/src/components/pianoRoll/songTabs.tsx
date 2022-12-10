import { FunctionComponent } from "react";
import { IoClose } from "react-icons/io5";
import { TiPlus } from "react-icons/ti";
import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import { usePianoRollStore, useTabControls } from "../../stores/pianoRollStore";
import PianoRollGrid from "./pianoRollGrid";
import * as React from "react";
import { SearchResult } from "../../interfaces/SearchResult";

interface SongTabsProps {
    disabled?: boolean;
    topSearchResult?: SearchResult;
}

const SongTabs: FunctionComponent<SongTabsProps> = (props) => {
    const [selectedIndex, songs] = usePianoRollStore((state) => [
        state.selectedIndex,
        state.songs,
    ]);
    const { canAddTab, selectTab, addTab, removeTab } = useTabControls();
    const maxW = songs.length < 7 ? "max-w-2xs" : "max-w-3xs";

    return (
        <Tabs selectedIndex={selectedIndex} onSelect={() => {}}>
            <TabList id="song-tabs" className="ml-4 flex outline-none">
                {songs.map((s, i) => (
                    <div
                        className={`flex flex-row justify-center rounded-t border-2 border-b-0 border-dark-primary hover:bg-medium-primary hover:text-black outline-none${
                            i === selectedIndex
                                ? " bg-medium-primary text-black"
                                : ` bg-light-primary text-white ${maxW}`
                        }`}
                        key={s.name}
                    >
                        <Tab
                            className={`p-2 outline-none${
                                i === selectedIndex ? "" : " truncate"
                            }`}
                            onClick={() => selectTab(i)}
                        >
                            {s.name}
                        </Tab>
                        <button
                            type="button"
                            className="p-1"
                            onClick={() => removeTab(i)}
                        >
                            <IoClose />
                        </button>
                    </div>
                ))}
                {canAddTab && (
                    <button
                        type="button"
                        className="mt-2 rounded-tr border-2 border-b-0 border-l-0 border-dark-primary  bg-light-primary p-2 text-white outline-none hover:bg-medium-primary hover:text-black"
                        onClick={() => addTab()}
                    >
                        <TiPlus />
                    </button>
                )}
            </TabList>
            {songs.map((s) => (
                <TabPanel
                    className="max-w-fit"
                    selectedClassName="tab-panel-selected"
                    key={s.name}
                >
                    <PianoRollGrid
                        gridParams={s.gridParams}
                        notes={s.notes}
                        topSearchResult={props.topSearchResult}
                        disabled={props.disabled}
                    />
                </TabPanel>
            ))}
        </Tabs>
    );
};

SongTabs.defaultProps = {
    disabled: false,
    topSearchResult: undefined,
};

export default SongTabs;
