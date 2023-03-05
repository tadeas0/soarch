import os
import pickle
import time
from dataclasses import dataclass
from random import shuffle

import config
import numpy as np
from app.midi.repository.file_repository import FileRepository, SongRepository
from app.search_engine.preprocessor import Preprocessor
from app.search_engine.search_engine import SearchEngine
from app.search_engine.search_engine_n_gram_prep import SearchEngineNGramPrep
from app.search_engine.strategy.melody_extraction_strategy import TopNoteStrategy
from app.search_engine.strategy.segmentation_strategy import (
    FixedLengthStrategy,
    SegmentationStrategy,
)
from app.search_engine.strategy.similarity_strategy import (
    DTWStrategy,
    EMDStrategySP,
    FDTWStrategyLib,
    LCSStrategy,
    LocalAlignmentStrategyLib,
    SimilarityStrategy,
)
from app.search_engine.strategy.standardization_strategy import (
    BaselineIntervalStrategy,
    DefaultStrategy,
    RelativeIntervalStrategy,
    StandardizationStrategy,
)
from app.util.filestorage.local_file_storage import LocalFileStorage
from config import MEASURE_LENGTH
from lab.example_query import ExampleQuery

CSV_HEADER = (
    "duration,search_engine_name,extraction,standardization,"
    "segmentation,similarity,result_position,query_name"
)


@dataclass
class Result:
    duration: float
    search_engine_name: str
    extraction_name: str
    standardization_name: str
    segmentation_name: str
    similarity_name: str
    result_position: int
    query_name: str


async def evaluate_search_engine(
    query: ExampleQuery, search_engine: SearchEngine
) -> Result:
    max_results = 200
    start_time = time.time()
    res = await search_engine.find_similar_async(max_results, query.track)
    duration = time.time() - start_time
    try:
        result_pos = [i[1].metadata for i in res].index(query.metadata)
    except ValueError:
        result_pos = -1
    return Result(
        duration,
        search_engine.__class__.__name__,
        search_engine.preprocessor.melody_extraction_strategy.__class__.__name__,
        search_engine.preprocessor.standardization_strategy.__class__.__name__,
        search_engine.preprocessor.segmentation_strategy.__class__.__name__,
        search_engine.similarity_strategy.__class__.__name__,
        result_pos,
        f"{query.metadata.artist} - {query.metadata.name}",
    )


async def test_all_combinations(
    query: ExampleQuery, repo: SongRepository
) -> list[Result]:
    results = []
    for search_engine in [SearchEngine, SearchEngineNGramPrep]:
        for similarity in [
            LocalAlignmentStrategyLib,
            EMDStrategySP,
            FDTWStrategyLib,
            LCSStrategy,
            DTWStrategy,
        ]:
            for standardization in [
                BaselineIntervalStrategy,
                RelativeIntervalStrategy,
                DefaultStrategy,
            ]:
                for segmentation in [FixedLengthStrategy]:
                    for extraction in [TopNoteStrategy]:
                        prep = Preprocessor(
                            extraction(),  # type: ignore
                            standardization(),  # type: ignore
                            segmentation(),  # type: ignore
                        )
                        se = search_engine(
                            repo,
                            prep,
                            similarity(),  # type: ignore
                        )
                        r = await evaluate_search_engine(query, se)
                        results.append(r)
    return results


def result_to_csv_row(result: Result):
    return ",".join(
        [
            str(result.duration),
            result.search_engine_name,
            result.extraction_name,
            result.standardization_name,
            result.segmentation_name,
            result.similarity_name,
            str(result.result_position),
            result.query_name,
        ]
    )


async def benchmark_search_engine():
    # setup_logging()
    fs = LocalFileStorage(os.path.join(config.MIDI_DIR, config.PROCESSED_MIDI_PREFIX))
    repo = FileRepository(fs)
    folders = [
        # "0_notes_changed",
        # "1_notes_changed",
        "1_notes_changed_transposed",
        # "2_notes_changed",
        "2_notes_changed_transposed",
        # "3_notes_changed",
        # "3_notes_changed_transposed",
        # "4_notes_changed",
        # "4_notes_changed_transposed",
        # "5_notes_changed",
        # "5_notes_changed_transposed",
    ]
    for folder in folders:
        output_path = os.path.join(
            config.ANALYSIS_OUTPUT_DIR, f"{config.PROCESS_COUNT}_processes_{folder}.csv"
        )
        query_dir = os.path.join(config.MIDI_DIR, config.QUERY_PREFIX, folder)
        queries: list[ExampleQuery] = []
        for i in os.listdir(query_dir):
            with open(os.path.join(query_dir, i), "rb") as f:
                q = pickle.load(f)
                queries.append(q)
        with open(output_path, "w") as f:
            f.write(CSV_HEADER + "\n")
        for i in queries:
            res = await test_all_combinations(i, repo)
            with open(output_path, "a") as f:
                for r in res:
                    f.write(result_to_csv_row(r) + "\n")

    # await benchmark_similarities()
    # await benchmark_standardization()
    # await benchmark_segmentation(repo)
    # await benchmark_repository(repo)
    # await benchmark_repository(mongo_repo)


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

    async for i in repo.get_all_songs():
        tracks.extend((i).tracks)

    for segmentation in SegmentationStrategy.__subclasses__():
        start_time = time.time()
        for j in tracks:
            segmentation().segment(j, MEASURE_LENGTH)  # type: ignore
        duration = time.time() - start_time
        print(f"{segmentation.__name__},{duration}")


async def benchmark_repository(repo: SongRepository):
    songs = []
    start_time = time.time()
    await repo.list_keys()
    async for i in repo.get_all_songs():
        songs.append(i)
    end_time = time.time()
    print(f"time: {end_time - start_time}")
