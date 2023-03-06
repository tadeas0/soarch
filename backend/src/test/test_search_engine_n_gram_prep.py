from app.entity.song import Note, Song, Track
from app.search_engine.strategy.melody_extraction_strategy import TopNoteStrategy
from app.search_engine.strategy.standardization_strategy import RelativeIntervalStrategy
from app.search_engine.strategy.similarity_strategy import LCSStrategy
from app.search_engine.strategy.segmentation_strategy import OneSegmentStrategy
import pytest
from app.search_engine.preprocessor import Preprocessor
from app.search_engine.search_engine_n_gram_prep import SearchEngineNGramPrep
from test.test_search_engine import MockRepository


def assert_result(result, expected_len):
    assert len(result) == expected_len
    for i in result:
        assert len(i) == 3
        assert isinstance(i[0], float)
        assert isinstance(i[1], Song)
        assert isinstance(i[2], Track)


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
    query = Track(
        [Note(0, 10, 32), Note(30, 10, 32), Note(40, 10, 32), Note(50, 10, 32)], 150
    )
    result1 = await search_engine.find_similar_async(2, query)
    result2 = await search_engine.find_similar_async(3, query)
    result3 = await search_engine.find_similar_async(5, query)
    result4 = await search_engine.find_similar_async(6, query)

    assert_result(result1, 2)
    assert_result(result2, 3)
    assert_result(result3, 5)
    assert_result(result4, 5)
