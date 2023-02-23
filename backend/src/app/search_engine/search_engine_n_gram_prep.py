from app.search_engine.search_engine import SearchEngine
from app.midi.repository.repository import SongRepository
from app.search_engine.preprocessor import Preprocessor
from app.search_engine.strategy.similarity_strategy import SimilarityStrategy
from app.util.song import Note, Song, Track
import numpy.typing as npt
import numpy as np


class SearchEngineNGramPrep(SearchEngine):
    N_GRAM_LENGTH = 5
    MIN_COMMON_CLASSES = 3

    def __init__(
        self,
        repository: SongRepository,
        preprocessor: Preprocessor,
        similarity_strategy: SimilarityStrategy,
    ) -> None:
        super().__init__(repository, preprocessor, similarity_strategy)

    def __extract_melody(self, track: Track) -> list[Note]:
        last_pitch = -1
        last_time = -1
        res: list[Note] = []
        for i in track.notes:
            if i.time == last_time and i.pitch > last_pitch:
                res[-1] = i
            elif i.time > last_time:
                res.append(i)
                last_time = i.time
                last_pitch = i.pitch
        return res

    def __extract_melodic_contour(self, notes: list[Note]) -> list[int]:
        last_pitch = notes[0].pitch
        res = []
        for i in notes:
            if i.pitch == last_pitch:
                res.append(0)
            elif i.pitch < last_pitch:
                res.append(-1)
            if i.pitch > last_pitch:
                res.append(1)
        return res

    def __classify_segment(self, melodic_contour: list[int]) -> int:
        melodic_rep = {1: 0b01, 0: 0b10, -1: 0b11}
        segment_class = 0b10
        for p in melodic_contour[1:]:
            segment_class = segment_class << 2 | melodic_rep[p]
        return segment_class

    def __generate_n_gram_classes(self, track: Track) -> set[int]:
        melody = self.__extract_melody(track)
        melodic_contour = self.__extract_melodic_contour(melody)
        classes = set()
        for i in range(len(melodic_contour)):
            segment_class = self.__classify_segment(
                melodic_contour[i : i + self.N_GRAM_LENGTH]
            )
            classes.add(segment_class)
        return classes

    def process_songs(
        self, keys: list[str], query_track: Track, query_prep: npt.NDArray[np.int64], n
    ) -> list[tuple[float, Song, Track]]:
        query_classes = self.__generate_n_gram_classes(query_track)

        results: list[tuple[float, Song, Track]] = []
        for key in keys:
            results.extend(
                self.__process_song(key, query_track, query_prep, query_classes)
            )
        post_res = self.postprocess_result_list(results, n)
        return [
            (i[0], Song([i[2]], i[1].bpm, i[1].metadata), i[2])
            for i in post_res
            if i[1].metadata
        ]

    def __process_song(
        self,
        key: str,
        query_track: Track,
        query_prep: npt.NDArray[np.int64],
        query_classes: set[int],
    ) -> list[tuple[float, Song, Track]]:
        results: list[tuple[float, Song, Track]] = []
        song = self.repository.load_song(key)

        for track in song.tracks:
            segments = self.preprocessor.segmentation_strategy.segment(
                track, query_track.grid_length
            )
            for segment in segments:
                n_gram_classes = self.__generate_n_gram_classes(segment)
                common_classes = len(query_classes.intersection(n_gram_classes))
                if common_classes > self.MIN_COMMON_CLASSES:
                    val = self.similarity_strategy.compare(
                        query_prep, self.preprocessor.prep_track(segment)
                    )
                    results.append((val, song, segment))
        return results
