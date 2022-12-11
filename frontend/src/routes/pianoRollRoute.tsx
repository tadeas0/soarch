import {
    FunctionComponent,
    useState,
    useContext,
    useCallback,
    useEffect,
} from "react";
import { BeatLoader } from "react-spinners";
import * as Tone from "tone";
import DownloadingOverlay from "../components/downloadingOverlay";
import PianoRoll from "../components/pianoRoll/pianoRoll";
import SearchResultsDrawer from "../components/searchResultsDrawer";
import StrategySelector, { Option } from "../components/strategySelector";
import {
    HIDE_STRATEGIES,
    LIGHT_PRIMARY,
    MIN_NOTES_FOR_FETCHING,
} from "../constants";
import { PlaybackProvider } from "../context/playbackContext";
import { AvailabilityContext } from "../context/serverAvailabilityContext";
import { API, NoteForm } from "../services/api";
import { Note, Sequencer } from "../sound/sequencer";
import { usePianoRollStore } from "../stores/pianoRollStore";
import { ShepherdTourContext } from "react-shepherd";
import BottomLogo from "../components/basic/bottomLogo";
import TourButton from "../components/pianoRoll/tourButton";
import { SearchResult } from "../interfaces/SearchResult";
import * as React from "react";
import useSequencer from "../hooks/sequencer/useSequencer";
import { SequencerContextProvider } from "../context/sequencerContext";

interface PianoRollRouteProps {}

const PianoRollRoute: FunctionComponent<PianoRollRouteProps> = () => {
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [availableStrategies, setAvailableStrategies] = useState<Option[]>(
        []
    );
    const [selectedStrategy, setSelectedStrategy] = useState<Option>({
        name: "Local alignment (Biopython lib)",
        value: "lcabp",
    });
    const [isBusy, setBusy] = useState<boolean>(false);
    const [initializing, setInitializing] = useState(false);
    const { setServerAvailable } = useContext(AvailabilityContext);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const addTab = usePianoRollStore((state) => state.addTab);
    const { stop } = useSequencer();
    const storageKey = "already-took-tour";
    const tour = useContext(ShepherdTourContext);

    const handleRequestErrors = useCallback(
        (err: any) => {
            if (err.response) {
                if (err.response.status === 500) {
                    setServerAvailable(false);
                } else {
                    console.log(err);
                }
            } else {
                console.log(err);
            }
        },
        [setServerAvailable]
    );

    useEffect(() => {
        const alreadyTookTour = localStorage.getItem(storageKey);
        if (!alreadyTookTour && tour) {
            tour.start();
            localStorage.setItem(storageKey, String(true));
        }
    }, [tour]);

    useEffect(() => {
        setInitializing(true);
        Promise.all([API.getSimilarityStrategies(), API.getExampleQueries()])
            .then(([resSimStrat]) => {
                const options = resSimStrat.data.map((r) => ({
                    name: r.name,
                    value: r.shortcut,
                }));
                setAvailableStrategies(options);
                setSelectedStrategy({
                    name: "Local alignment (Biopython lib)",
                    value: "lcabp",
                });
                setServerAvailable(true);
            })
            .catch(handleRequestErrors)
            .finally(() => setInitializing(false));
    }, [setServerAvailable, handleRequestErrors]);

    const handleSubmit = async (notes: Note[], gridLength: number) => {
        setBusy(true);
        if (notes.length < MIN_NOTES_FOR_FETCHING) {
            setSearchResults([]);
            setBusy(false);
            return;
        }

        const reqBody: NoteForm = {
            gridLength,
            notes: notes.map((n) => ({
                pitch: Tone.Frequency(n.pitch).toMidi(),
                length: n.length,
                time: n.time,
            })),
        };
        if (selectedStrategy)
            reqBody.similarityStrategy = selectedStrategy.value;
        try {
            const res = await API.postNotes(reqBody);
            const result = res.data.tracks.map<SearchResult>((track) => ({
                artist: track.artist,
                name: track.name,
                notes: track.notes.map<Note>((n) => ({
                    time: Tone.Time(n.time).toBarsBeatsSixteenths(),
                    pitch: Tone.Frequency(n.pitch, "midi").toNote(),
                    length: Tone.Time(n.length).toBarsBeatsSixteenths(),
                })),
                bpm: track.bpm,
            }));
            setSearchResults(result);
        } catch (err) {
            handleRequestErrors(err);
        } finally {
            setBusy(false);
        }
    };

    const handleEdit = (searchResult: SearchResult) => {
        setIsDrawerOpen(false);
        stop();
        addTab({
            bpm: Math.round(searchResult.bpm),
            name: searchResult.name,
            notes: searchResult.notes,
            gridParams: Sequencer.getGridParamsFromNotes(searchResult.notes),
        });
    };

    const handleDrawerToggle = () => {
        stop();
        setIsDrawerOpen((current) => !current);
    };

    return (
        <div className="piano-roll-route">
            {initializing ? (
                <div className="flex h-screen w-screen flex-col items-center justify-center">
                    <BeatLoader size={100} color={LIGHT_PRIMARY} />
                    <h1 className="mt-4 text-2xl">
                        Connecting to the server...
                    </h1>
                </div>
            ) : (
                <PlaybackProvider>
                    <SequencerContextProvider>
                        <TourButton />
                        <BottomLogo />
                        {isDownloading && <DownloadingOverlay />}
                        <PianoRoll
                            setIsDownloading={setIsDownloading}
                            isFetchingResults={isBusy}
                            topSearchResult={searchResults.at(0)}
                            onShowMore={handleDrawerToggle}
                            onSubmit={handleSubmit}
                            disabled={isDrawerOpen}
                        />
                        <div>
                            {selectedStrategy && !HIDE_STRATEGIES && (
                                <StrategySelector
                                    options={availableStrategies}
                                    onChange={setSelectedStrategy}
                                />
                            )}
                        </div>
                        {(searchResults.length > 0 || isBusy) && (
                            <SearchResultsDrawer
                                onOpen={handleDrawerToggle}
                                onClose={handleDrawerToggle}
                                isOpen={isDrawerOpen}
                                searchResults={searchResults}
                                isBusy={isBusy}
                                onEdit={handleEdit}
                            />
                        )}
                    </SequencerContextProvider>
                </PlaybackProvider>
            )}
        </div>
    );
};

export default PianoRollRoute;
