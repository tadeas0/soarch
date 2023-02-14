from dataclasses import dataclass
from app.util.filestorage.local_file_storage import LocalFileStorage
from app.midi.repository.file_repository import FileRepository, SongRepository
from app.search_engine.strategy.melody_extraction_strategy import TopNoteStrategy
from app.search_engine.strategy.segmentation_strategy import FixedLengthStrategy
from app.search_engine.strategy.similarity_strategy import LocalAlignmentStrategyLib
from app.search_engine.strategy.standardization_strategy import RelativeIntervalStrategy
from app.search_engine.search_engine import SearchEngine
import os
import time
from random import shuffle
import numpy as np
from app.search_engine.preprocessor import Preprocessor
from lab.example_query import ExampleQuery
import config
import pickle

from config import (
    MEASURE_LENGTH,
    MIDI_DIR,
)
from app.search_engine.strategy.melody_extraction_strategy import (
    MelodyExtractionStrategy,
)
from app.search_engine.strategy.standardization_strategy import StandardizationStrategy
from app.search_engine.strategy.similarity_strategy import SimilarityStrategy
from app.search_engine.strategy.segmentation_strategy import SegmentationStrategy


CSV_HEADER = (
    "duration,extraction,standardization,"
    "segmentation,similarity,result_position,query_name"
)


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
    query: ExampleQuery, search_engine: SearchEngine
) -> Result:
    max_results = len(await search_engine.repository.list_keys())
    start_time = time.time()
    res = await search_engine.find_similar_async(max_results, query.track)
    duration = time.time() - start_time
    result_pos = [i[1].metadata for i in res].index(query.metadata)
    return Result(
        duration,
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
    for similarity in SimilarityStrategy.__subclasses__():
        for standardization in StandardizationStrategy.__subclasses__():
            for segmentation in SegmentationStrategy.__subclasses__():
                for extraction in MelodyExtractionStrategy.__subclasses__():
                    prep = Preprocessor(
                        extraction(),  # type: ignore
                        standardization(),  # type: ignore
                        segmentation(),  # type: ignore
                    )
                    se = SearchEngine(
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
            result.extraction_name,
            result.standardization_name,
            result.segmentation_name,
            result.similarity_name,
            str(result.result_position),
            result.query_name,
        ]
    )


async def benchmark_search_engine():
    fs = LocalFileStorage(os.path.join(config.MIDI_DIR, config.PROCESSED_MIDI_PREFIX))
    repo = FileRepository(fs)
    # mongo_repo = MongoRepository(config.MONGODB_URL)
    query_dir = os.path.join(config.MIDI_DIR, config.QUERY_PREFIX)
    queries: list[ExampleQuery] = []
    for i in os.listdir(query_dir):
        with open(os.path.join(query_dir, i), "rb") as f:
            q = pickle.load(f)
            queries.append(q)

    print(CSV_HEADER)
    prep = Preprocessor(
        TopNoteStrategy(), RelativeIntervalStrategy(), FixedLengthStrategy()
    )
    se = SearchEngine(repo, prep, LocalAlignmentStrategyLib())
    for i in queries:
        res = await evaluate_search_engine(i, se)
        print(result_to_csv_row(res))
        # for r in res:
        # print(result_to_csv_row(r))

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
