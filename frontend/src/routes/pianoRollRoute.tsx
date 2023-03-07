import { FunctionComponent, useState, useContext, useEffect } from "react";
import { BeatLoader } from "react-spinners";
import DownloadingOverlay from "../components/downloadingOverlay";
import PianoRoll from "../components/pianoRoll/pianoRoll";
import SearchResultsDrawer from "../components/searchResultsDrawer";
import { LIGHT_PRIMARY } from "../constants";
import { PlaybackProvider } from "../context/playbackContext";
import API from "../services/api";
import { useTabControls } from "../stores/pianoRollStore";
import { ShepherdTourContext } from "react-shepherd";
import TourButton from "../components/pianoRoll/tourButton";
import { SearchResult } from "../interfaces/SearchResult";
import * as React from "react";
import useSequencer from "../hooks/sequencer/useSequencer";
import { getGridParamsFromNotes } from "../common/coordConversion";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import useIsXlScreen from "../hooks/useIsXlScreen";
import { useQuery } from "react-query";
import ControlModals from "../components/pianoRoll/controlModals";
import useSearchResults from "../hooks/useSearchResults";
import { SongParams } from "../interfaces/SongParams";
import Settings from "../components/settings";

interface PianoRollRouteProps {}

const PianoRollRoute: FunctionComponent<PianoRollRouteProps> = () => {
    const handle = useFullScreenHandle();
    const isXl = useIsXlScreen();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const { addTab } = useTabControls();
    const { stop } = useSequencer();
    const storageKey = "already-took-tour";
    const tour = useContext(ShepherdTourContext);
    const { isLoading, searchResults, mutate } = useSearchResults();
    const { isFetching: isConnecting } = useQuery(
        "serverAvailable",
        async ({ signal }) => {
            const res = await API.getHealthCheck({ signal });
            return res.status === 200;
        },
        {
            refetchOnWindowFocus: false,
        }
    );

    useEffect(() => {
        if (isXl) {
            const alreadyTookTour = localStorage.getItem(storageKey);
            if (!alreadyTookTour && tour) {
                tour.start();
                localStorage.setItem(storageKey, String(true));
            }
        }
    }, [handle.active, tour, isXl]);

    const handleEdit = (searchResult: SearchResult) => {
        setIsDrawerOpen(false);
        stop();
        const newSong: SongParams = {
            bpm: Math.round(searchResult.bpm),
            name: searchResult.name,
            notes: searchResult.notes,
            gridParams: getGridParamsFromNotes(searchResult.notes),
        };
        addTab(newSong);
        mutate(newSong);
    };

    const handleDrawerToggle = () => {
        stop();
        setIsDrawerOpen((current) => !current);
    };

    return (
        <FullScreen handle={handle}>
            <ControlModals fullscreenHandle={handle} />
            <div className="piano-roll-route h-full bg-background p-2 lg:p-8">
                {isConnecting ? (
                    <div className="flex h-screen w-screen flex-col items-center justify-center">
                        <BeatLoader size={100} color={LIGHT_PRIMARY} />
                        <h1 className="mt-4 text-2xl">
                            Connecting to the server...
                        </h1>
                    </div>
                ) : (
                    <PlaybackProvider>
                        <Settings />
                        <TourButton />
                        {isDownloading && <DownloadingOverlay />}
                        <PianoRoll
                            setIsDownloading={setIsDownloading}
                            isFetchingResults={isLoading}
                            topSearchResult={searchResults?.at(0)}
                            onShowMore={handleDrawerToggle}
                            disabled={isDrawerOpen}
                        />
                        <SearchResultsDrawer
                            onOpen={handleDrawerToggle}
                            onClose={handleDrawerToggle}
                            isOpen={isDrawerOpen}
                            searchResults={searchResults || []}
                            isBusy={isLoading}
                            onEdit={handleEdit}
                        />
                    </PlaybackProvider>
                )}
            </div>
        </FullScreen>
    );
};

export default PianoRollRoute;
