import { FunctionComponent, useState, useContext, useEffect } from "react";
import { BeatLoader } from "react-spinners";
import DownloadingOverlay from "../components/downloadingOverlay";
import PianoRoll from "../components/pianoRoll/pianoRoll";
import SearchResultsDrawer from "../components/searchResultsDrawer";
import {
    LIGHT_PRIMARY,
    MIN_NOTES_FOR_FETCHING,
    SEARCH_RESULT_KEY,
} from "../constants";
import { PlaybackProvider } from "../context/playbackContext";
import API from "../services/api";
import { NoteForm } from "../interfaces/NoteForm";
import {
    usePianoRollStore,
    useSelectedSong,
    useTabControls,
} from "../stores/pianoRollStore";
import { ShepherdTourContext } from "react-shepherd";
import TourButton from "../components/pianoRoll/tourButton";
import { SearchResult } from "../interfaces/SearchResult";
import * as React from "react";
import useSequencer from "../hooks/sequencer/useSequencer";
import { getGridParamsFromNotes } from "../common/coordConversion";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import useIsXlScreen from "../hooks/useIsXlScreen";
import { useQuery } from "react-query";
import { deserializeSong, serializeNote } from "../common/common";
import ControlModals from "../components/pianoRoll/controlModals";

interface PianoRollRouteProps {}

const PianoRollRoute: FunctionComponent<PianoRollRouteProps> = () => {
    const selectedStrategy = {
        name: "Local alignment (Biopython lib)",
        value: "lcabp",
    };
    const handle = useFullScreenHandle();
    const isXl = useIsXlScreen();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const { addTab } = useTabControls();
    const selectedSong = useSelectedSong();
    const selectedIndex = usePianoRollStore((state) => state.selectedIndex);
    const { stop } = useSequencer();
    const storageKey = "already-took-tour";
    const tour = useContext(ShepherdTourContext);
    const { isFetching, data: searchResults } = useQuery(
        [SEARCH_RESULT_KEY, selectedIndex],
        async ({ signal }) => {
            if (selectedSong.notes.length < MIN_NOTES_FOR_FETCHING) return [];
            const reqBody: NoteForm = {
                gridLength: selectedSong.gridParams.width,
                notes: selectedSong.notes.map(serializeNote),
            };
            if (selectedStrategy)
                reqBody.similarityStrategy = selectedStrategy.value;
            const res = await API.postNotes(reqBody, { signal });
            const result = res.data.tracks.map<SearchResult>(deserializeSong);
            return result;
        },
        {
            initialData: [],
            keepPreviousData: true,
            refetchOnWindowFocus: false,
            staleTime: Infinity,
        }
    );
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
        addTab({
            bpm: Math.round(searchResult.bpm),
            name: searchResult.name,
            notes: searchResult.notes,
            gridParams: getGridParamsFromNotes(searchResult.notes),
        });
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
                        <TourButton />
                        {isDownloading && <DownloadingOverlay />}
                        <PianoRoll
                            setIsDownloading={setIsDownloading}
                            isFetchingResults={isFetching}
                            topSearchResult={searchResults?.at(0)}
                            onShowMore={handleDrawerToggle}
                            disabled={isDrawerOpen}
                        />
                        <SearchResultsDrawer
                            onOpen={handleDrawerToggle}
                            onClose={handleDrawerToggle}
                            isOpen={isDrawerOpen}
                            searchResults={searchResults || []}
                            isBusy={isFetching}
                            onEdit={handleEdit}
                        />
                    </PlaybackProvider>
                )}
            </div>
        </FullScreen>
    );
};

export default PianoRollRoute;
