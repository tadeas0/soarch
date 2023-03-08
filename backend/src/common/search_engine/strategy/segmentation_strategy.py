from abc import abstractmethod, ABC
from common.entity.song import Track, Note


class SegmentationStrategy(ABC):
    @abstractmethod
    def segment(self, track: Track, segment_len: int) -> list[Track]:
        pass


class OneSegmentStrategy(SegmentationStrategy):
    def segment(self, track: Track, segment_len: int) -> list[Track]:
        return [track]


class FixedLengthStrategy(SegmentationStrategy):
    def segment(self, track: Track, segment_len: int) -> list[Track]:
        if track.grid_length <= segment_len:
            return [track]
        segments: dict[int, Track] = dict()

        for n in track.notes:
            segment_num = n.time // segment_len
            new_time = n.time % segment_len
            new_len = n.length
            if new_time + new_len > segment_len:
                new_len = segment_len - new_time

            new_note = Note(new_time, new_len, n.pitch)
            if segment_num in segments:
                segments[segment_num].notes.append(new_note)
            else:
                segments[segment_num] = Track([new_note], segment_len)
        return list(segments.values())
