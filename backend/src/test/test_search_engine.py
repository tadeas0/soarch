from asyncio import Future
import unittest.mock
from app.util.song import Note, Song, SongMetadata, Track
from app.midi.repository import SongRepository
from app.util.filestorage import FileStorage
from app.search_engine.search_engine import SearchEngine
from app.search_engine.strategy.melody_extraction_strategy import TopNoteStrategy
from app.search_engine.strategy.standardization_strategy import RelativeIntervalStrategy
from app.search_engine.strategy.similarity_strategy import LCSStrategy
from app.search_engine.strategy.segmentation_strategy import OneSegmentStrategy
import pytest


def list_keys_mock(cls):
    return ["0", "1", "2", "3", "4"]


async def load_song_async_mock(cls, file_path: str):
    track = Track([Note(0, 10, 0)], 100)
    return Song([track], 120, SongMetadata(f"artist{file_path}", f"song{file_path}"))


async def get_all_songs(cls):
    res = []
    for i in range(5):
        track = Track([Note(0, 10, 0)], 100)
        f = Future()
        f.set_result(Song([track], 120, SongMetadata(f"artist{i}", f"song{i}")))
        res.append(f)
    return res


class MockFileStorage(FileStorage):
    async def initialize(self) -> None:
        raise NotImplementedError()

    def list_all(self):
        raise NotImplementedError()

    def list_prefix(self, prefix):
        raise NotImplementedError()

    async def read(self, key):
        raise NotImplementedError()

    async def write(self, key, content):
        raise NotImplementedError()

    async def read_all_prefix(self, prefix):
        raise NotImplementedError()

    async def read_all_keys(self, keys):
        raise NotImplementedError()


def assert_result(result, expected_len):
    assert len(result) == expected_len
    for i in result:
        assert len(i) == 3
        assert isinstance(i[0], float)
        assert isinstance(i[1], Song)
        assert isinstance(i[2], Track)


@unittest.mock.patch.object(SongRepository, "list_keys", list_keys_mock)
@unittest.mock.patch.object(SongRepository, "load_song_async", load_song_async_mock)
@unittest.mock.patch.object(SongRepository, "get_all_songs", get_all_songs)
@pytest.mark.asyncio
async def test_find_similar_async():
    repository = SongRepository(MockFileStorage())
    search_engine = SearchEngine(
        repository,
        TopNoteStrategy(),
        RelativeIntervalStrategy(),
        LCSStrategy(),
        OneSegmentStrategy(),
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
