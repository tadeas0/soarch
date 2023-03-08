from app.repository.song_repository import SongRepository
from app.search_engine.search_engine import SearchEngine
from app.search_engine.search_engine_n_gram_prep import SearchEngineNGramPrep
from app.search_engine.strategy.melody_extraction_strategy import TopNoteStrategy
from app.search_engine.strategy.standardization_strategy import RelativeIntervalStrategy
from app.search_engine.strategy.similarity_strategy import SimilarityStrategy
from app.search_engine.strategy.segmentation_strategy import FixedLengthStrategy
from app.search_engine.preprocessor import Preprocessor
import logging
import config

logger = logging.getLogger(config.DEFAULT_LOGGER)


class SearchEngineFactory:
    @staticmethod
    def create_search_engine(
        repository: SongRepository, strategy_repr: str, use_n_gram_prep: bool
    ) -> SearchEngine:
        for i in SimilarityStrategy.__subclasses__():
            # NOTE: MyPy throws error, which can be safely ignored,
            # because the abstract class is never accessed
            # (__subclasses__() does not return the parent class)
            if i().shortcut == strategy_repr:  # type: ignore
                prep = Preprocessor(
                    TopNoteStrategy(), RelativeIntervalStrategy(), FixedLengthStrategy()
                )
                if use_n_gram_prep:
                    logger.debug("Using SearchEngineNGramPrep")
                    return SearchEngineNGramPrep(repository, prep, i())  # type: ignore
                logger.debug("Using SearchEngine")
                return SearchEngine(
                    repository,
                    prep,
                    i(),  # type: ignore
                )

        raise ValueError("Unknown similarity strategy")
