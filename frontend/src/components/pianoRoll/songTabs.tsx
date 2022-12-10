import { FunctionComponent } from "react";
import { IoClose } from "react-icons/io5";
import { TiPlus } from "react-icons/ti";
import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import { usePianoRollStore, useTabControls } from "../../stores/pianoRollStore";
import PianoRollGrid from "./pianoRollGrid";
import * as React from "react";
import { CgUndo } from "react-icons/cg";
import { MdDelete } from "react-icons/md";

interface SongTabsProps {
    disabled?: boolean;
}

const SongTabs: FunctionComponent<SongTabsProps> = (props) => {
    const [selectedIndex, songs, undo, clear] = usePianoRollStore((state) => [
        state.selectedIndex,
        state.songs,
        state.undo,
        state.clear,
    ]);
    const { canAddTab, selectTab, addTab, removeTab } = useTabControls();
    const maxW = songs.length < 7 ? "max-w-2xs" : "max-w-3xs";

    return (
        <Tabs selectedIndex={selectedIndex} onSelect={() => {}}>
            <div className="flex flex-row">
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
                <span className="ml-auto mr-4 -mb-1 self-end p-0  text-3xl">
                    <button
                        type="button"
                        className="ml-auto mb-0 rounded-t border-2 border-b-0 border-dark-primary bg-light-primary p-2 text-white hover:bg-medium-primary hover:text-black"
                        onClick={undo}
                    >
                        <CgUndo />
                    </button>
                    <button
                        type="button"
                        className="ml-auto mb-0 rounded-t border-2 border-b-0 border-dark-primary bg-light-primary p-2 text-white hover:bg-medium-primary hover:text-black"
                        onClick={clear}
                    >
                        <MdDelete />
                    </button>
                </span>
            </div>
            {songs.map((s) => (
                <TabPanel
                    className="max-w-fit"
                    selectedClassName="tab-panel-selected"
                    key={s.name}
                >
                    <PianoRollGrid
                        gridParams={s.gridParams}
                        notes={s.notes}
                        disabled={props.disabled}
                    />
                </TabPanel>
            ))}
        </Tabs>
    );
};

SongTabs.defaultProps = {
    disabled: false,
};

export default SongTabs;
