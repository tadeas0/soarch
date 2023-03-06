import logging
import config
import numpy.typing as npt
import numpy as np
from app.repository.song_repository import SongRepository
from app.search_engine.strategy.similarity_strategy import SimilarityStrategy
from app.util.song import Song, Track
import multiprocessing as mp
from app.search_engine.preprocessor import Preprocessor
import itertools
from app.util.helpers import split_list


logger = logging.getLogger(config.DEFAULT_LOGGER)

END_TOKEN = "STOP"


class SearchEngine:
    def __init__(
        self,
        repository: SongRepository,
        preprocessor: Preprocessor,
        similarity_strategy: SimilarityStrategy,
    ) -> None:
        self.repository = repository
        self.similarity_strategy = similarity_strategy
        self.preprocessor = preprocessor

    async def find_similar_async(
        self, n: int, query_track: Track
    ) -> list[tuple[float, Song, Track]]:
        query_prep = self.preprocessor.prep_track(query_track)
        results = []

        with mp.get_context("forkserver").Pool(config.PROCESS_COUNT) as pool:
            keys = await self.repository.list_keys()
            chunks = split_list(keys, config.PROCESS_COUNT)
            tasks = [
                pool.apply_async(self.process_songs, (i, query_track, query_prep, n))
                for i in chunks
            ]
            results = [i.get() for i in tasks]

        return self.postprocess_result_list(
            list(itertools.chain.from_iterable(results)), n
        )

    def postprocess_result_list(
        self, results: list[tuple[float, Song, Track]], n: int
    ) -> list[tuple[float, Song, Track]]:
        sorted_results = sorted(
            results,
            reverse=self.similarity_strategy.highest_first,
            key=lambda a: (
                a[0],
                a[1].metadata.name if a[1].metadata else "",
                a[1].metadata.artist if a[1].metadata else "",
            ),
        )
        logger.info("Postprocessing search results")
        metadata: set[tuple[str, str]] = set()
        unique_results: list[tuple[float, Song, Track]] = []
        for i in sorted_results:
            if i[1].metadata:
                meta_tuple = (i[1].metadata.artist, i[1].metadata.name)
                if meta_tuple not in metadata:
                    metadata.add(meta_tuple)
                    unique_results.append(i)

        if len(unique_results) >= n:
            return unique_results[0:n]

        return unique_results

    def process_songs(
        self, keys: list[str], query_track: Track, query_prep: npt.NDArray[np.int64], n
    ) -> list[tuple[float, Song, Track]]:
        results: list[tuple[float, Song, Track]] = []
        for key in keys:
            results.extend(self.process_song(key, query_track, query_prep))
        post_res = self.postprocess_result_list(results, n)
        return [
            (i[0], Song([i[2]], i[1].metadata), i[2]) for i in post_res if i[1].metadata
        ]

    def process_song(
        self, key: str, query_track: Track, query_prep: npt.NDArray[np.int64]
    ) -> list[tuple[float, Song, Track]]:
        results: list[tuple[float, Song, Track]] = []
        song = self.repository.load_song(key)

        for track in song.tracks:
            segments = self.preprocessor.segmentation_strategy.segment(
                track, query_track.grid_length
            )
            for segment in segments:
                val = self.similarity_strategy.compare(
                    query_prep, self.preprocessor.prep_track(segment)
                )
                results.append((val, song, segment))
        return results
