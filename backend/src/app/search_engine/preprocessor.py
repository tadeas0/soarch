from app.search_engine.strategy.melody_extraction_strategy import (
    MelodyExtractionStrategy,
)
import numpy.typing as npt
import numpy as np
from app.search_engine.strategy.standardization_strategy import StandardizationStrategy
from app.search_engine.strategy.segmentation_strategy import SegmentationStrategy
from common.entity.song import Segment, Song, Track
import config


class Preprocessor:
    def __init__(
        self,
        melody_extraction_strategy: MelodyExtractionStrategy,
        standardization_strategy: StandardizationStrategy,
        segmentation_strategy: SegmentationStrategy,
    ) -> None:
        self.melody_extraction_strategy = melody_extraction_strategy
        self.standardization_strategy = standardization_strategy
        self.segmentation_strategy = segmentation_strategy

    def prep_track(self, track: Track) -> npt.NDArray[np.int64]:
        melody = self.melody_extraction_strategy.extract(track)
        return self.standardization_strategy.standardize(melody)

    def preprocess(
        self, song: Song, segment_len: int = config.MEASURE_LENGTH
    ) -> list[Segment]:
        segments = []
        for track in song.tracks:
            s = self.segmentation_strategy.segment(track, segment_len)
            segments.extend([Segment(i, self.prep_track(track)) for i in s])
        return segments
