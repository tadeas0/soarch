import { FunctionComponent } from "react";
import { IoClose } from "react-icons/io5";
import { TiPlus } from "react-icons/ti";
import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import GridParams from "../../interfaces/GridParams";
import { Note } from "../../sequencer";
import { DEFAULT_SONG_PARAMS } from "./pianoRoll";
import PianoRollGrid from "./pianoRollGrid";
import "./tabs.css";

export interface SongParams {
    name: string;
    bpm: number;
    notes: Note[];
    gridParams: GridParams;
}

interface SongTabsProps {
    selectedSongIndex: number;
    onChangeIndex: (newIndex: number) => void;
    onCloseTab: (index: number) => void;
    onAddTab: (song: SongParams) => void;
    onAddNote: (note: Note) => void;
    onDeleteNote: (note: Note) => void;
    songs: SongParams[];
}

const SongTabs: FunctionComponent<SongTabsProps> = (props) => {
    return (
        <Tabs
            selectedIndex={props.selectedSongIndex}
            className="tabs"
            onSelect={() => {}}
        >
            <TabList className="tab-list">
                {props.songs.map((s, i) => (
                    <div
                        className={
                            "tab-container" +
                            (i === props.selectedSongIndex
                                ? " tab-container-selected"
                                : "")
                        }
                        key={i}
                    >
                        <Tab
                            selectedClassName="tab-selected"
                            className="tab"
                            onClick={() => props.onChangeIndex(i)}
                        >
                            {s.name}
                        </Tab>
                        <button
                            className="close-tab-button"
                            onClick={() => props.onCloseTab(i)}
                        >
                            <IoClose />
                        </button>
                    </div>
                ))}
                <button
                    className="add-tab-button"
                    onClick={() => props.onAddTab(DEFAULT_SONG_PARAMS)}
                >
                    <TiPlus />
                </button>
            </TabList>
            {props.songs.map((s, i) => (
                <TabPanel
                    className="tab-panel"
                    selectedClassName="tab-panel-selected"
                    key={i}
                >
                    <PianoRollGrid
                        onAddNote={props.onAddNote}
                        onDeleteNote={props.onDeleteNote}
                        gridParams={s.gridParams}
                        notes={s.notes}
                    />
                </TabPanel>
            ))}
        </Tabs>
    );
};

export default SongTabs;
