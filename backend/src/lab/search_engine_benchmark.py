from dataclasses import dataclass
from app.util.filestorage.local_file_storage import LocalFileStorage
from app.util.song import SongMetadata, Track
from app.midi.repository.file_repository import FileRepository, SongRepository
from app.search_engine.search_engine import SearchEngine
import os
import re
from miditoolkit import MidiFile
from app.util.parser.midi_parser import MidiParser
import time
from random import shuffle
import numpy as np

from config import (
    MEASURE_LENGTH,
    MIDI_DIR,
    PROCESSED_MIDI_PREFIX,
    RAW_EXAMPLE_PREFIX,
)
from app.search_engine.strategy.melody_extraction_strategy import (
    MelodyExtractionStrategy,
)
from app.search_engine.strategy.standardization_strategy import StandardizationStrategy
from app.search_engine.strategy.similarity_strategy import SimilarityStrategy
from app.search_engine.strategy.segmentation_strategy import SegmentationStrategy


CSV_HEADER = "duration,extraction,standardization,segmentation,similarity,result_position,query_name"


@dataclass
class Result:
    duration: float
    extraction_name: str
    standardization_name: str
    segmentation_name: str
    similarity_name: str
    result_position: int
    query_name: str


async def evaluate_search_engine(
    query: Track, expected_metadata: SongMetadata, search_engine: SearchEngine
) -> Result:
    max_results = len(await search_engine.repository.list_keys())
    start_time = time.time()
    res = await search_engine.find_similar_async(max_results, query)
    duration = time.time() - start_time
    result_pos = [i[1].metadata for i in res].index(expected_metadata)
    return Result(
        duration,
        search_engine.extraction_strategy.__class__.__name__,
        search_engine.standardization_strategy.__class__.__name__,
        search_engine.segmentation_strategy.__class__.__name__,
        search_engine.similarity_strategy.__class__.__name__,
        result_pos,
        f"{expected_metadata.artist} - {expected_metadata.name}",
    )


async def test_all_combinations(
    query: Track, expected_metadata: SongMetadata, repo: SongRepository
) -> list[Result]:
    results = []
    for similarity in SimilarityStrategy.__subclasses__():
        for standardization in StandardizationStrategy.__subclasses__():
            for segmentation in SegmentationStrategy.__subclasses__():
                for extraction in MelodyExtractionStrategy.__subclasses__():
                    se = SearchEngine(
                        repo,
                        extraction(),  # type: ignore
                        standardization(),  # type: ignore
                        similarity(),  # type: ignore
                        segmentation(),  # type: ignore
                    )
                    r = await evaluate_search_engine(query, expected_metadata, se)
                    results.append(r)
    return results


def result_to_csv_row(result: Result):
    return ",".join(
        [
            str(result.duration),
            result.extraction_name,
            result.standardization_name,
            result.segmentation_name,
            result.similarity_name,
            str(result.result_position),
            result.query_name,
        ]
    )


def get_metadata_from_filepath(file_path: str):
    last = file_path.split("/")[-1]

    m = re.match(r"(.*) - (.*)\.mid$", last)
    artist = "Unknown artist"
    name = "Unknown song"
    if m and m.group(1):
        artist = m.group(1)
    if m and m.group(2):
        name = m.group(2)
    return SongMetadata(artist, name)


async def benchmark_search_engine():
    fs = LocalFileStorage(MIDI_DIR)
    repo = FileRepository(fs)
    repo.load_directory(PROCESSED_MIDI_PREFIX)
    repo.load_directory(RAW_EXAMPLE_PREFIX)
    # repo.load_directory(RAW_MIDI_PREFIX)
    queries: list[tuple[Track, SongMetadata]] = []
    queries_path = "../midi_files/queries"
    for i in os.listdir(queries_path):
        filepath = os.path.join(queries_path, i)
        mf = MidiFile(filepath)
        song = MidiParser.parse(mf)
        metadata = get_metadata_from_filepath(filepath)
        query_tuple = (song.tracks[0], metadata)
        queries.append(query_tuple)
    print(CSV_HEADER)
    for i in queries:
        res = await test_all_combinations(*i, repo)
        for r in res:
            print(result_to_csv_row(r))

    # await benchmark_similarities()
    # await benchmark_standardization()
    # await benchmark_segmentation(repo)


async def benchmark_similarities():
    arrays = []
    comparisons = 100000
    for i in range(comparisons * 2):
        arrays.append(np.random.randint(0, 127, size=8))
    shuffle(arrays)
    a1 = arrays[: len(arrays) // 2]
    a2 = arrays[len(arrays) // 2 :]
    for similarity in SimilarityStrategy.__subclasses__():
        start_time = time.time()
        for i1, i2 in zip(a1, a2):
            similarity().compare(i1, i2)  # type: ignore
        duration = time.time() - start_time
        print(f"{similarity.__name__},{duration}")


async def benchmark_standardization():
    arrays = []
    lines = 100000
    for i in range(lines):
        arrays.append(np.random.randint(0, 127, size=8))
    shuffle(arrays)
    for standardization in StandardizationStrategy.__subclasses__():
        start_time = time.time()
        for i in arrays:
            standardization().standardize(i)  # type: ignore
        duration = time.time() - start_time
        print(f"{standardization.__name__},{duration}")


async def benchmark_segmentation(repo: SongRepository):
    tracks = []

    for i in await repo.get_all_songs():
        tracks.extend((await i).tracks)

    for segmentation in SegmentationStrategy.__subclasses__():
        start_time = time.time()
        for i in tracks:
            segmentation().segment(i, MEASURE_LENGTH)  # type: ignore
        duration = time.time() - start_time
        print(f"{segmentation.__name__},{duration}")
