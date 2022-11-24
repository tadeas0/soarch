import { FunctionComponent } from "react";
import { IoClose } from "react-icons/io5";
import { TiPlus } from "react-icons/ti";
import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import GridParams from "../../interfaces/GridParams";
import { Note } from "../../sound/sequencer";
import { usePianoRollStore, useTabControls } from "../../stores/pianoRollStore";
import PianoRollGrid from "./pianoRollGrid";
import "./tabs.css";

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
        <Tabs
            selectedIndex={selectedIndex}
            className="tabs"
            onSelect={() => {}}
        >
            <TabList className="tab-list">
                {songs.map((s, i) => (
                    <div
                        className={
                            "tab-container" +
                            (i === selectedIndex
                                ? " tab-container-selected"
                                : "")
                        }
                        key={i}
                    >
                        <Tab
                            selectedClassName="tab-selected"
                            className="tab"
                            onClick={() => selectTab(i)}
                        >
                            {s.name}
                        </Tab>
                        <button
                            className="close-tab-button"
                            onClick={() => removeTab(i)}
                            disabled={songs.length <= 1}
                        >
                            <IoClose />
                        </button>
                    </div>
                ))}
                <button
                    className={
                        "add-tab-button" + (canAddTab ? "" : " inactive")
                    }
                    onClick={() => addTab()}
                >
                    <TiPlus />
                </button>
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
