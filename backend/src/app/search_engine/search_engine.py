from functools import lru_cache
import logging
import config
import asyncio
from typing import List, Tuple, Set
from app.midi.repository import SongRepository
from app.search_engine.similarity_strategy import SimilarityStrategy
from app.midi.song import Song, Track
from app.search_engine.melody_extraction_strategy import MelodyExtractionStrategy
from app.search_engine.standardization_strategy import StandardizationStrategy

logger = logging.getLogger(config.DEFAULT_LOGGER)


# TODO: test preprocessing caching
# TODO: cleanup result format
class SearchEngine:
    def __init__(
        self,
        repository: SongRepository,
        extraction_strategy: MelodyExtractionStrategy,
        standardization_strategy: StandardizationStrategy,
        similarity_strategy: SimilarityStrategy,
    ) -> None:
        self.repository = repository
        self.extraction_strategy = extraction_strategy
        self.standardization_strategy = standardization_strategy
        self.similarity_strategy = similarity_strategy

    def find_similar(
        self, n: int, query_track: Track
    ) -> List[Tuple[float, Song, Track]]:
        logger.info("Searching song")
        songs: Set[Tuple[float, Song, Track]] = set()
        query_prep = self.__preprocess_track(query_track)
        for song in self.repository.get_all():
            for track in song.tracks:
                sim = self.similarity_strategy.compare(
                    query_prep, self.__preprocess_track(track)
                )
                songs.add((sim, song, track))
        logger.info("Found similar song")
        return sorted(
            songs, reverse=self.similarity_strategy.highest_first, key=lambda a: a[0]
        )[0:n]

    async def find_similar_async(self, n: int, query_track: Track):
        logger.info("Searching song")
        songs: List[Tuple[float, Song, Track]] = []
        query_prep = self.__preprocess_track(query_track)
        in_q: asyncio.Queue[Song] = asyncio.Queue()
        out_q: asyncio.Queue[Tuple[float, Song, Track]] = asyncio.Queue()
        consumer = asyncio.ensure_future(self.__consume_queue(query_prep, in_q, out_q))
        await self.__fetch_files_to_queue(in_q)
        await in_q.join()
        consumer.cancel()

        while not out_q.empty():
            songs.append(await out_q.get())

        return sorted(
            songs, reverse=self.similarity_strategy.highest_first, key=lambda a: a[0]
        )[0:n]

    async def __fetch_files_to_queue(self, q: asyncio.Queue):
        keys = self.repository.list_keys()
        coros = [self.repository.load_song_async(i) for i in keys]

        for future in asyncio.as_completed(coros):
            res = await future
            await q.put(res)

    async def __consume_queue(
        self, query_prep, in_q: asyncio.Queue, out_q: asyncio.Queue
    ):
        songs: Set[Tuple[float, Song, Track]] = set()
        while True:
            song = await in_q.get()

            for track in song.tracks:
                sim = self.similarity_strategy.compare(
                    query_prep, self.__preprocess_track(track)
                )

                await out_q.put((sim, song, track))
            in_q.task_done()

    @lru_cache()
    def __preprocess_track(self, track: Track):
        m = self.extraction_strategy.extract(track)
        return self.standardization_strategy.standardize(m)
