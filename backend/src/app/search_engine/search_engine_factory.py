from app.midi.repository import SongRepository
from app.search_engine.search_engine import SearchEngine
from app.search_engine.melody_extraction_strategy import TopNoteStrategy
from app.search_engine.standardization_strategy import RelativeIntervalStrategy
from app.search_engine.similarity_strategy import (
    EMDStrategy,
    LCSStrategy,
    DTWStrategy,
    LocalAlignmentStrategy,
)


class SearchEngineFactory:
    @staticmethod
    def create_search_engine(
        repository: SongRepository, strategy_repr: str
    ) -> SearchEngine:
        similarity_strategy_dict = {
            "emd": EMDStrategy(),
            "lcs": LCSStrategy(),
            "dtw": DTWStrategy(),
            "la": LocalAlignmentStrategy(),
        }

        return SearchEngine(
            repository,
            TopNoteStrategy(),
            RelativeIntervalStrategy(),
            similarity_strategy_dict[strategy_repr],
        )
