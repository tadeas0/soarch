from common.entity.search_result import SearchResult
from common.entity.song import Note, SongMetadata, Track
from app.search_engine.search_engine import SearchEngine
from app.search_engine.strategy.melody_extraction_strategy import TopNoteStrategy
from app.search_engine.strategy.standardization_strategy import RelativeIntervalStrategy
from app.search_engine.strategy.similarity_strategy import LCSStrategy
from app.search_engine.strategy.segmentation_strategy import OneSegmentStrategy
import pytest
from app.search_engine.preprocessor import Preprocessor
from test.mocks.mock_repository import MockRepository


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
    search_engine = SearchEngine(
        repository,
        prep,
        LCSStrategy(),
    )
    query = Track([Note(0, 10, 32), Note(30, 10, 32)], 150)
    result1 = await search_engine.find_similar_async(2, query)
    result2 = await search_engine.find_similar_async(3, query)
    result3 = await search_engine.find_similar_async(5, query)
    result4 = await search_engine.find_similar_async(6, query)

    assert_result(result1, 2)
    assert_result(result2, 3)
    assert_result(result3, 5)
    assert_result(result4, 5)
