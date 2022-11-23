import { FunctionComponent } from "react";
import { IoClose } from "react-icons/io5";
import { TiPlus } from "react-icons/ti";
import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import {
    PianoRollActionType,
    usePianoRollDispatch,
    usePianoRollState,
} from "../../context/pianoRollContext";
import GridParams from "../../interfaces/GridParams";
import { Note } from "../../sound/sequencer";
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
    const state = usePianoRollState();
    const dispatch = usePianoRollDispatch();

    return (
        <Tabs
            selectedIndex={state.selectedIndex}
            className="tabs"
            onSelect={() => {}}
        >
            <TabList className="tab-list">
                {state.songs.map((s, i) => (
                    <div
                        className={
                            "tab-container" +
                            (i === state.selectedIndex
                                ? " tab-container-selected"
                                : "")
                        }
                        key={i}
                    >
                        <Tab
                            selectedClassName="tab-selected"
                            className="tab"
                            onClick={() =>
                                dispatch({
                                    type: PianoRollActionType.SELECT_TAB,
                                    payload: i,
                                })
                            }
                        >
                            {s.name}
                        </Tab>
                        <button
                            className="close-tab-button"
                            onClick={() =>
                                dispatch({
                                    type: PianoRollActionType.REMOVE_TAB,
                                    payload: i,
                                })
                            }
                            disabled={state.songs.length <= 1}
                        >
                            <IoClose />
                        </button>
                    </div>
                ))}
                <button
                    className="add-tab-button"
                    onClick={() =>
                        dispatch({
                            type: PianoRollActionType.ADD_TAB,
                        })
                    }
                >
                    <TiPlus />
                </button>
            </TabList>
            {state.songs.map((s, i) => (
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
