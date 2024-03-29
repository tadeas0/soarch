from common.entity.search_result import SearchResult
from common.entity.song import Note, SongMetadata, Track
from common.search_engine.strategy.melody_extraction_strategy import TopNoteStrategy
from common.search_engine.strategy.standardization_strategy import (
    RelativeIntervalStrategy,
)
from common.search_engine.strategy.similarity_strategy import LCSStrategy
from common.search_engine.strategy.segmentation_strategy import OneSegmentStrategy
import pytest
from common.search_engine.preprocessor import Preprocessor
from common.search_engine.search_engine_n_gram_prep import SearchEngineNGramPrep
from test.test_search_engine import MockRepository


def assert_result(result: list[SearchResult], expected_len: int):
    assert len(result) == expected_len
    for i in result:
        assert isinstance(i, SearchResult)
        assert isinstance(i.similarity, float)
        assert isinstance(i.metadata, SongMetadata)
        assert isinstance(i.track, Track)


@pytest.mark.asyncio
async def test_find_similar_async():
    repository = MockRepository()
    prep = Preprocessor(
        TopNoteStrategy(), RelativeIntervalStrategy(), OneSegmentStrategy()
    )
    search_engine = SearchEngineNGramPrep(
        repository,
        prep,
        LCSStrategy(),
    )
    query = Track([Note(i * 10, 10, 0) for i in range(8)], 150)
    result1 = await search_engine.find_similar_async(2, query)
    result2 = await search_engine.find_similar_async(3, query)
    result3 = await search_engine.find_similar_async(5, query)
    result4 = await search_engine.find_similar_async(6, query)

    assert_result(result1, 2)
    assert_result(result2, 3)
    assert_result(result3, 5)
    assert_result(result4, 5)
