from app.midi.repository import SongRepository
from app.search_engine.search_engine import SearchEngine
from app.search_engine.melody_extraction_strategy import TopNoteStrategy
from app.search_engine.standardization_strategy import RelativeIntervalStrategy
from app.search_engine.similarity_strategy import SimilarityStrategy


class SearchEngineFactory:
    @staticmethod
    def create_search_engine(
        repository: SongRepository, strategy_repr: str
    ) -> SearchEngine:
        for i in SimilarityStrategy.__subclasses__():
            # NOTE: MyPy throws error, which can be safely ignored,
            # because the abstract class is never accessed
            # (__subclasses__() does not return the parent class)
            if i().shortcut == strategy_repr:  # type: ignore
                return SearchEngine(
                    repository,
                    TopNoteStrategy(),
                    RelativeIntervalStrategy(),
                    i())  # type: ignore

        raise ValueError("Unknown similarity strategy")
