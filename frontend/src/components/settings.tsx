import * as React from "react";
import { ChangeEvent, FunctionComponent, useRef, useState } from "react";
import { IoMdSettings } from "react-icons/io";
import { useSettingsStore } from "../stores/settingsStore";
import Button from "./basic/button";
import * as Tone from "tone";
import { MAX_VOLUME_DB, MIN_VOLUME_DB } from "../constants";
import useClickawayListener from "../hooks/useClickawayListener";

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
                        <li className="group">
                            <label className="block rounded-tr-md p-2 group-hover:bg-medium-primary group-hover:text-black">
                                Use faster search
                                <input
                                    id="fasterSearch"
                                    type="checkbox"
                                    checked={useFasterSearch}
                                    onChange={() =>
                                        setUseFasterSearch(!useFasterSearch)
                                    }
                                    className="ml-4 rounded bg-white text-medium-primary focus:ring-0 focus:ring-offset-0 group-hover:text-dark-primary"
                                />
                            </label>
                        </li>
                        <li className="rounded-l-md p-2">
                            <label htmlFor="volume">
                                <h4>Volume</h4>
                            </label>
                            <input
                                id="volume"
                                type="range"
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
