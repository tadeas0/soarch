import { FunctionComponent } from "react";
import { IoClose } from "react-icons/io5";
import { TiPlus } from "react-icons/ti";
import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import GridParams from "../../interfaces/GridParams";
import { Note } from "../../sound/sequencer";
import { usePianoRollStore, useTabControls } from "../../stores/pianoRollStore";
import PianoRollGrid from "./pianoRollGrid";

export interface SongParams {
    name: string;
    bpm: number;
    notes: Note[];
    gridParams: GridParams;
}

interface SongTabsProps {
    disabled?: boolean;
    disabledHeader?: boolean;
}

const SongTabs: FunctionComponent<SongTabsProps> = (props) => {
    const [selectedIndex, songs] = usePianoRollStore((state) => [
        state.selectedIndex,
        state.songs,
    ]);
    const { canAddTab, selectTab, addTab, removeTab } = useTabControls();

    return (
        <Tabs selectedIndex={selectedIndex} onSelect={() => {}}>
            <TabList id="song-tabs" className="ml-4 flex">
                {songs.map((s, i) => (
                    <div
                        className={
                            "flex flex-row justify-center rounded-t border-2 border-b-0 border-dark-primary hover:bg-medium-primary hover:text-black" +
                            (i === selectedIndex
                                ? " bg-medium-primary text-black"
                                : " bg-light-primary text-white")
                        }
                        key={i}
                    >
                        <Tab className="p-2" onClick={() => selectTab(i)}>
                            {s.name}
                        </Tab>
                        <button className="p-1" onClick={() => removeTab(i)}>
                            <IoClose />
                        </button>
                    </div>
                ))}
                {canAddTab && (
                    <button
                        className="mt-2 rounded-tr border-2 border-b-0 border-l-0 border-dark-primary  bg-light-primary p-2 text-white hover:bg-medium-primary hover:text-black"
                        onClick={() => addTab()}
                    >
                        <TiPlus />
                    </button>
                )}
            </TabList>
            {songs.map((s, i) => (
                <TabPanel
                    className="tab-panel"
                    selectedClassName="tab-panel-selected"
                    key={i}
                >
                    <PianoRollGrid
                        gridParams={s.gridParams}
                        notes={s.notes}
                        disabled={props.disabled}
                        disabledHeader={props.disabledHeader}
                    />
                </TabPanel>
            ))}
        </Tabs>
    );
};

SongTabs.defaultProps = {
    disabled: false,
    disabledHeader: false,
};

export default SongTabs;
