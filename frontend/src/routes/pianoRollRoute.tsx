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
import StrategySelector from "../components/strategySelector";
import { SECONDARY_COLOR, HIDE_STRATEGIES } from "../constants";
import { PlaybackProvider } from "../context/playbackContext";
import { AvailabilityContext } from "../context/serverAvailabilityContext";
import usePlayback from "../hooks/usePlayback";
import { API, NoteForm } from "../services/api";
import { Note, Sequencer } from "../sound/sequencer";
import { Option } from "../components/strategySelector";
import { usePianoRollStore } from "../stores/pianoRollStore";

export interface SearchResult {
    artist: string;
    name: string;
    notes: Note[];
    bpm: number;
}

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
    const [, , handleStop] = usePlayback();

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
        setInitializing(true);
        Promise.all([API.getSimilarityStrategies(), API.getExampleQueries()])
            .then(([resSimStrat]) => {
                const options = resSimStrat.data.map((r) => {
                    return {
                        name: r.name,
                        value: r.shortcut,
                    };
                });
                setAvailableStrategies(options);
                setSelectedStrategy(options[0]);
                setServerAvailable(true);
            })
            .catch(handleRequestErrors)
            .finally(() => setInitializing(false));
    }, [setServerAvailable, handleRequestErrors]);

    const handleSubmit = (notes: Note[], gridLength: number) => {
        setBusy(true);
        let reqBody: NoteForm = {
            gridLength: gridLength,
            notes: notes.map((n) => {
                return {
                    pitch: Tone.Frequency(n.pitch).toMidi(),
                    length: n.length,
                    time: n.time,
                };
            }),
        };
        if (selectedStrategy)
            reqBody.similarityStrategy = selectedStrategy.value;
        API.postNotes(reqBody)
            .then((res) => {
                const result = res.data.tracks.map<SearchResult>((track) => {
                    return {
                        artist: track.artist,
                        name: track.name,
                        notes: track.notes.map<Note>((n) => {
                            return {
                                time: Tone.Time(n.time).toBarsBeatsSixteenths(),
                                pitch: Tone.Frequency(n.pitch, "midi").toNote(),
                                length: Tone.Time(
                                    n.length
                                ).toBarsBeatsSixteenths(),
                            };
                        }),
                        bpm: track.bpm,
                    };
                });
                setSearchResults(result);
            })
            .catch(handleRequestErrors)
            .finally(() => setBusy(false));
    };

    const handleEdit = (searchResult: SearchResult) => {
        setIsDrawerOpen(false);
        handleStop();
        addTab({
            bpm: searchResult.bpm,
            name: searchResult.name,
            notes: searchResult.notes,
            gridParams: Sequencer.getGridParamsFromNotes(searchResult.notes),
        });
    };

    const handleDrawerToggle = () => {
        handleStop();
        setIsDrawerOpen((current) => !current);
    };

    return (
        <div className="piano-roll-route">
            {initializing ? (
                <div>
                    <BeatLoader size={100} color={SECONDARY_COLOR} />
                    <h1>Connecting to the server...</h1>
                </div>
            ) : (
                <PlaybackProvider>
                    {isDownloading && <DownloadingOverlay />}
                    <PianoRoll
                        setIsDownloading={setIsDownloading}
                        isDownloading={isDownloading}
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
                                selectedValue={selectedStrategy}
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
                </PlaybackProvider>
            )}
        </div>
    );
};

export default PianoRollRoute;
