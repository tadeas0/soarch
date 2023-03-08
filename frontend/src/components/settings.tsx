import * as React from "react";
import { ChangeEvent, FunctionComponent, useRef, useState } from "react";
import { IoMdSettings } from "react-icons/io";
import { useSettingsStore } from "../stores/settingsStore";
import Button from "./basic/button";
import * as Tone from "tone";
import { MAX_VOLUME_DB, MIN_VOLUME_DB } from "../constants";
import useClickawayListener from "../hooks/useClickawayListener";
import Tooltip from "./basic/tooltip";
import { AiOutlineInfoCircle } from "react-icons/ai";

interface SettingsProps {}

const Settings: FunctionComponent<SettingsProps> = () => {
    const [open, setOpen] = useState(false);
    const { useFasterSearch, setUseFasterSearch, volume, setVolume } =
        useSettingsStore();
    const divRef = useRef<HTMLDivElement>(null);
    useClickawayListener(divRef, () => {
        setOpen(false);
    });

    const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value);
        setVolume(val);
        const newVol = val * (MAX_VOLUME_DB - MIN_VOLUME_DB) + MIN_VOLUME_DB;
        Tone.getDestination().volume.value = newVol;
    };

    return (
        <div
            className="absolute top-0 left-0 z-10 flex flex-col items-start"
            ref={divRef}
        >
            <Button
                className="rounded-l-none rounded-tr-none text-xl"
                pressed={open}
                onClick={() => setOpen((current) => !current)}
            >
                <IoMdSettings />
            </Button>
            {open && (
                <div className="rounded-r-md border-2 border-l-0 border-black bg-light-primary text-white">
                    <ul>
                        <li className="group/fastersearch">
                            <label className="flex flex-row items-center rounded-tr-md p-2 group-hover/fastersearch:bg-medium-primary group-hover/fastersearch:text-black">
                                <input
                                    id="fasterSearch"
                                    type="checkbox"
                                    checked={useFasterSearch}
                                    onChange={() =>
                                        setUseFasterSearch(!useFasterSearch)
                                    }
                                    className="mr-4 rounded bg-white text-medium-primary focus:ring-0 focus:ring-offset-0 group-hover/fastersearch:text-dark-primary"
                                />
                                Use faster search
                                <span className="ml-4">
                                    <Tooltip text="Sacrifice some accuracy in order to provide faster results.">
                                        <AiOutlineInfoCircle />
                                    </Tooltip>
                                </span>
                            </label>
                        </li>
                        <li className="rounded-l-md p-2">
                            <label htmlFor="volume">
                                <h4>Volume</h4>
                            </label>
                            <input
                                id="volume"
                                type="range"
                                className="accent-medium-primary outline-none focus:ring-0 focus:ring-offset-0"
                                min={0}
                                max={1}
                                step={0.1}
                                value={volume}
                                onChange={handleVolumeChange}
                            />
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Settings;
