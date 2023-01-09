import logging
from multiprocessing.managers import ListProxy
import config
import numpy.typing as npt
import numpy as np
from app.midi.repository.repository import SongRepository
from app.search_engine.strategy.similarity_strategy import SimilarityStrategy
from app.util.song import Song, Track
import multiprocessing as mp
from app.search_engine.preprocessor import Preprocessor


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
        logger.info("Searching song")
        songs: list[tuple[float, Song, Track]] = []
        query_prep = self.preprocessor.prep_track(query_track)
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
        async for song in self.repository.get_all_songs():
            try:
                q.put(song)
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
        results: list[tuple[float, Song, Track]] = []
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

    def __compare_songs(
        self, song: Song, query_track: Track, preprocessed_query: npt.NDArray[np.int64]
    ) -> list[tuple[float, Track]]:
        results: list[tuple[float, Track]] = []
        segments = self.preprocessor.preprocess(song, query_track.grid_length)
        for segment in segments:
            sim = self.similarity_strategy.compare(
                segment.processed_notes, preprocessed_query
            )
            results.append((sim, segment.track))
        return results
