import { FunctionComponent, useRef } from "react";
import { IoClose } from "react-icons/io5";
import { TiPlus } from "react-icons/ti";
import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import {
    DEFAULT_SONG_PARAMS,
    usePianoRollStore,
    useTabControls,
} from "../../stores/pianoRollStore";
import PianoRollGrid from "./pianoRollGrid";
import * as React from "react";
import { CgUndo } from "react-icons/cg";
import { MdDelete } from "react-icons/md";
import { FaSave } from "react-icons/fa";
import saveToFile from "../../common/saveTrack";
import useSynth from "../../hooks/sequencer/useSynth";
import useSearchResults from "../../hooks/useSearchResults";
import { usePlaybackMachine } from "../../context/pianorollContext";

interface SongTabsProps {
    disabled?: boolean;
    setIsDownloading: (v: boolean) => void;
}

const SongTabs: FunctionComponent<SongTabsProps> = (props) => {
    const [selectedIndex, songs, undo, clear] = usePianoRollStore((state) => [
        state.selectedIndex,
        state.songs,
        state.undo,
        state.clear,
    ]);
    const { canAddTab, selectTab, addTab, removeTab } = useTabControls();
    const [, send] = usePlaybackMachine();
    const { synth } = useSynth();
    const selectedSong = songs[selectedIndex];
    const tabListContainer = useRef<HTMLElement | null>(null);
    const maxW = songs.length < 7 ? "max-w-2xs" : "max-w-3xs";
    const { mutate } = useSearchResults();

    const handleSave = async () => {
        try {
            props.setIsDownloading(true);
            await saveToFile(
                selectedSong.notes,
                selectedSong.bpm,
                selectedSong.gridParams.width,
                selectedSong.name,
                synth
            );
        } catch (err) {
            console.error(err);
        } finally {
            props.setIsDownloading(false);
        }
    };

    const handleAddTab = async () => {
        if (canAddTab) {
            send("STOP");
            await addTab();
            if (tabListContainer.current) {
                const el = tabListContainer.current.querySelector("#song-tabs");
                if (el) el.scrollLeft = el.scrollWidth;
            }
            mutate(DEFAULT_SONG_PARAMS, true);
        }
    };

    const handleSelectTab = (n: number) => {
        send("STOP");
        selectTab(n);
        mutate(songs[n], true);
    };

    const handleRemoveTab = (n: number) => {
        send("STOP");
        removeTab(n);
        mutate(DEFAULT_SONG_PARAMS, true);
    };

    const handleClear = () => {
        send("STOP");
        clear();
        mutate(DEFAULT_SONG_PARAMS, true);
    };

    return (
        <Tabs
            selectedIndex={selectedIndex}
            domRef={(ref) => {
                tabListContainer.current = ref || null;
            }}
            onSelect={() => {}}
        >
            <div className="flex flex-row">
                <TabList
                    id="song-tabs"
                    className="ml-4 flex max-w-md overflow-x-auto rounded-t border-2 border-b-0 border-black outline-none last:border-r-0 xl:max-w-5xl"
                >
                    {songs.map((s, i) => (
                        <div
                            className={`flex flex-row  justify-center border-r-2 border-b-0 border-dark-primary last:border-r-0 hover:bg-medium-primary hover:text-black outline-none${
                                i === selectedIndex
                                    ? " bg-medium-primary text-black"
                                    : ` bg-light-primary text-white ${maxW}`
                            }`}
                            key={s.name}
                        >
                            <Tab
                                className={`max-h-8 overflow-hidden py-2 px-1 outline-none${
                                    i === selectedIndex ? "" : " truncate"
                                }`}
                                onClick={() => handleSelectTab(i)}
                            >
                                {s.name}
                            </Tab>
                            <button
                                type="button"
                                className="p-1"
                                onClick={() => handleRemoveTab(i)}
                            >
                                <IoClose />
                            </button>
                        </div>
                    ))}
                </TabList>
                {canAddTab && (
                    <button
                        type="button"
                        className="mt-2 rounded-tr border-2 border-b-0 border-l-0 border-dark-primary  bg-light-primary p-2 text-white outline-none hover:bg-medium-primary hover:text-black"
                        onClick={handleAddTab}
                    >
                        <TiPlus />
                    </button>
                )}
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
                        onClick={handleClear}
                    >
                        <MdDelete />
                    </button>
                    <button
                        type="button"
                        className="ml-auto mb-0 rounded-t border-2 border-b-0 border-dark-primary bg-light-primary p-2 text-white hover:bg-medium-primary hover:text-black"
                        onClick={handleSave}
                    >
                        <FaSave />
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
