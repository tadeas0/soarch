import logging
import config
import asyncio
import numpy.typing as npt
import numpy as np
from app.midi.repository import SongRepository
from app.search_engine.strategy.similarity_strategy import SimilarityStrategy
from app.midi.song import Song, Track
from app.search_engine.strategy.melody_extraction_strategy import (
    MelodyExtractionStrategy,
)
from app.search_engine.strategy.standardization_strategy import StandardizationStrategy
from app.search_engine.strategy.segmentation_strategy import SegmentationStrategy

logger = logging.getLogger(config.DEFAULT_LOGGER)


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
        in_q: asyncio.Queue[Song] = asyncio.Queue()
        out_q: asyncio.Queue[tuple[float, Song, Track]] = asyncio.Queue()
        consumer = asyncio.ensure_future(
            self.__consume_queue(query_track, query_prep, in_q, out_q)
        )
        await self.__fetch_files_to_queue(in_q)
        await in_q.join()
        consumer.cancel()

        while not out_q.empty():
            songs.append(await out_q.get())

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
        logger.debug("Postprocessing search results")
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

    async def __fetch_files_to_queue(self, q: asyncio.Queue) -> None:
        keys = self.repository.list_keys()
        coros = [self.repository.load_song_async(i) for i in keys]

        for future in asyncio.as_completed(coros):
            try:
                res = await future
                await q.put(res)
            except IOError as e:
                logger.warning(f"Failed to parse song {e}")

    async def __consume_queue(
        self,
        query_track: Track,
        query_prep,
        in_q: asyncio.Queue[Song],
        out_q: asyncio.Queue[tuple[float, Song, Track]],
    ) -> None:
        while True:
            song = await in_q.get()

            # NOTE: Cannot return song without metadata,
            # as there would be nothing to display
            if song.metadata:
                for track in song.tracks:
                    segments = self.segmentation_strategy.segment(
                        track, query_track.grid_length
                    )
                    for segment in segments:
                        prep_seg = self.__preprocess_track(segment)
                        sim = self.similarity_strategy.compare(query_prep, prep_seg)

                        await out_q.put((sim, song, segment))
            in_q.task_done()

    def __preprocess_track(self, track: Track) -> npt.NDArray[np.int64]:
        m = self.extraction_strategy.extract(track)
        return self.standardization_strategy.standardize(m)
