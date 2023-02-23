from app.util.song import Note, Song, SongMetadata, Track
from app.midi.repository.repository import SongRepository
from app.search_engine.search_engine import SearchEngine
from app.search_engine.strategy.melody_extraction_strategy import TopNoteStrategy
from app.search_engine.strategy.standardization_strategy import RelativeIntervalStrategy
from app.search_engine.strategy.similarity_strategy import LCSStrategy
from app.search_engine.strategy.segmentation_strategy import OneSegmentStrategy
import pytest
from app.search_engine.preprocessor import Preprocessor


class MockRepository(SongRepository):
    async def list_keys(self):
        return ["0", "1", "2", "3", "4"]

    def load_song(self, file_path: str):
        track = Track([Note(0, 10, 0)], 100)
        return Song(
            [track], 120, SongMetadata(f"artist{file_path}", f"song{file_path}")
        )

    def load_song_async(self, file_path: str):
        return self.load_song(file_path)

    def get_all_songs(self):
        for i in range(5):
            track = Track([Note(0, 10, 0)], 100)
            yield Song([track], 120, SongMetadata(f"artist{i}", f"song{i}"))

    def insert(self):
        pass

    def insert_many(self):
        pass


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
