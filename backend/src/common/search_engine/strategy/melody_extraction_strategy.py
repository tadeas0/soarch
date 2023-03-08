from common.entity.song import Track
from abc import ABC, abstractmethod
import numpy as np
import numpy.typing as npt


class MelodyExtractionStrategy(ABC):
    @abstractmethod
    def extract(self, track: Track) -> npt.NDArray[np.int64]:
        pass


class TopNoteStrategy(MelodyExtractionStrategy):
    def extract(self, track: Track) -> npt.NDArray[np.int64]:
        last_pitch = -1
        last_time = -1
        res: list[int] = []
        for i in track.notes:
            if i.time == last_time and i.pitch > last_pitch:
                res[-1] = i.pitch
            elif i.time > last_time:
                res.append(i.pitch)
                last_time = i.time
                last_pitch = i.pitch
        return np.array(res)
