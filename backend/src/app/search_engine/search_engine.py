import logging
from multiprocessing.managers import ListProxy
import config
import numpy.typing as npt
import numpy as np
from app.midi.repository import SongRepository
from app.search_engine.strategy.similarity_strategy import SimilarityStrategy
from app.util.song import Song, Track
import multiprocessing as mp
from app.search_engine.strategy.melody_extraction_strategy import (
    MelodyExtractionStrategy,
)
from app.search_engine.strategy.standardization_strategy import StandardizationStrategy
from app.search_engine.strategy.segmentation_strategy import SegmentationStrategy

logger = logging.getLogger(config.DEFAULT_LOGGER)

END_TOKEN = "STOP"


class SearchEngine:
    def __init__(
        self,
        repository: SongRepository,
        extraction_strategy: MelodyExtractionStrategy,
        standardization_strategy: StandardizationStrategy,
        similarity_strategy: SimilarityStrategy,
        segmentation_strategy: SegmentationStrategy,
    ) -> None:
        self.repository = repository
        self.extraction_strategy = extraction_strategy
        self.standardization_strategy = standardization_strategy
        self.similarity_strategy = similarity_strategy
        self.segmentation_strategy = segmentation_strategy

    async def find_similar_async(
        self, n: int, query_track: Track
    ) -> list[tuple[float, Song, Track]]:
        logger.info("Searching song")
        songs: list[tuple[float, Song, Track]] = []
        query_prep = self.__preprocess_track(query_track)
        in_q: mp.Queue = mp.Queue()
        manager = mp.Manager()
        results_buff = manager.list()
        consumers = [
            mp.Process(
                target=self.__consume_queue,
                args=(query_track, query_prep, in_q, results_buff, n),
            )
            for i in range(config.PROCESS_COUNT)
        ]
        for c in consumers:
            c.start()
        await self.__fetch_files_to_queue(in_q)
        logger.info("Fetching finished")
        for i in range(config.PROCESS_COUNT):
            in_q.put(END_TOKEN)
        for c in consumers:
            c.join()
        songs = list(results_buff)

        return self.__postprocess_result_list(songs, n)

    def __postprocess_result_list(
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

    async def __fetch_files_to_queue(self, q: mp.Queue) -> None:
        for future in self.repository.get_all_songs():
            try:
                res = await future
                q.put(res)
            except IOError as e:
                logger.warning(f"Failed to parse song {e}")

    def __consume_queue(
        self,
        query_track: Track,
        query_prep,
        in_q: mp.Queue,
        out_q: ListProxy,
        n: int,
    ) -> None:
        logger.debug("Starting consumer")
        results = []
        while True:
            song = in_q.get(block=True)
            if song == END_TOKEN:
                logger.debug("Stopping consumer")
                out_q.extend(self.__postprocess_result_list(results, n))
                return

            # NOTE: Cannot return song without metadata,
            # as there would be nothing to display
            if song.metadata:
                res = self.__compare_songs(song, query_track, query_prep)
                for i in res:
                    results.append((i[0], song, i[1]))

    def __segment_song(self, song: Song, segment_len: int) -> list[Track]:
        res = []
        for track in song.tracks:
            segments = self.segmentation_strategy.segment(track, segment_len)
            res.extend(segments)
        return res

    def __compare_songs(
        self, song: Song, query_track: Track, preprocessed_query: npt.NDArray[np.int64]
    ) -> list[tuple[float, Track]]:
        results: list[tuple[float, Track]] = []
        segments = self.__segment_song(song, query_track.grid_length)
        for segment in segments:
            sim = self.__compare_query(segment, preprocessed_query)
            results.append((sim, segment))
        return results

    def __compare_query(self, track: Track, prep_query: npt.NDArray[np.int64]) -> float:
        prep_seg = self.__preprocess_track(track)
        sim = self.similarity_strategy.compare(prep_query, prep_seg)
        return sim

    def __preprocess_track(self, track: Track) -> npt.NDArray[np.int64]:
        m = self.extraction_strategy.extract(track)
        return self.standardization_strategy.standardize(m)
