import * as React from "react";
import { FunctionComponent, useState } from "react";
import { IoMdSettings } from "react-icons/io";
import { useSettingsStore } from "../stores/settingsStore";
import Button from "./basic/button";

interface SettingsProps {}

const Settings: FunctionComponent<SettingsProps> = () => {
    const [open, setOpen] = useState(false);
    const { useFasterSearch, setUseFasterSearch, volume, setVolume } =
        useSettingsStore();

    return (
        <div className="absolute top-0 left-0 z-10 flex flex-col items-start">
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
                                onChange={(e) =>
                                    setVolume(Number(e.target.value))
                                }
                            />
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Settings;
