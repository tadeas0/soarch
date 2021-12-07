import logging
import config
import asyncio
import numpy.typing as npt
import numpy as np
from app.midi.repository import SongRepository
from app.search_engine.strategy.similarity_strategy import SimilarityStrategy
from app.midi.song import Song, SongMetadata, Track
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

    def find_similar(
        self, n: int, query_track: Track
    ) -> list[tuple[float, SongMetadata, Track]]:
        logger.info("Searching song")
        songs: list[tuple[float, SongMetadata, Track]] = []
        query_prep = self.__preprocess_track(query_track)
        for song in self.repository.get_all():
            if song.metadata:
                for track in song.tracks:
                    segments = self.segmentation_strategy.segment(
                        track, query_track.grid_length
                    )
                    for segment in segments:
                        proc_seg = self.__preprocess_track(segment)

                        sim = self.similarity_strategy.compare(query_prep[0], proc_seg)
                        songs.append((sim, song.metadata, segment))
        logger.info("Found similar song")
        return self.__postprocess_result_list(songs, n)

    async def find_similar_async(self, n: int, query_track: Track):
        logger.info("Searching song")
        songs: list[tuple[float, SongMetadata, Track]] = []
        query_prep = self.__preprocess_track(query_track)
        in_q: asyncio.Queue[Song] = asyncio.Queue()
        out_q: asyncio.Queue[tuple[float, SongMetadata, Track]] = asyncio.Queue()
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
        self, results: list[tuple[float, SongMetadata, Track]], n: int
    ):
        sorted_results = sorted(
            results,
            reverse=self.similarity_strategy.highest_first,
            key=lambda a: (a[0], a[1].name, a[1].artist),
        )
        logger.debug("Postprocessing search results")
        metadata: set[tuple[str, str]] = set()
        unique_results: list[tuple[float, SongMetadata, Track]] = []
        for i in sorted_results:
            meta_tuple = (i[1].artist, i[1].name)
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
            res = await future
            await q.put(res)

    async def __consume_queue(
        self,
        query_track: Track,
        query_prep,
        in_q: asyncio.Queue[Song],
        out_q: asyncio.Queue[tuple[float, SongMetadata, Track]],
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

                        await out_q.put((sim, song.metadata, segment))
            in_q.task_done()

    def __preprocess_track(self, track: Track) -> npt.NDArray[np.int64]:
        m = self.extraction_strategy.extract(track)
        return self.standardization_strategy.standardize(m)
