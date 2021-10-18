from app.search_engine.song import Track
from abc import ABC, abstractmethod
from typing import List
import numpy as np


class MelodyExtractionStrategy(ABC):
    @abstractmethod
    def extract(self, track: Track):
        pass


class TopNoteStrategy(MelodyExtractionStrategy):
    def extract(self, track: Track):
        last_pitch = -1
        last_time = -1
        res: List[int] = []
        for i in track.notes:
            if i.time == last_time and i.pitch > last_pitch:
                res[-1] = i.pitch
            elif i.time > last_time:
                res.append(i.pitch)
                last_time = i.time
                last_pitch = i.pitch
        return np.array(res)
