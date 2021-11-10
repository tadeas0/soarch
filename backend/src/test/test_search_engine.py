import unittest.mock
from app.midi.song import Note, Song, SongMetadata, Track
from app.midi.repository import SongRepository
from app.midi.filestorage import FileStorage
from app.search_engine.search_engine import SearchEngine
from app.search_engine.melody_extraction_strategy import TopNoteStrategy
from app.search_engine.standardization_strategy import RelativeIntervalStrategy
from app.search_engine.similarity_strategy import LCSStrategy
import pytest


def list_keys_mock(cls):
    return ["0", "1", "2", "3", "4"]


def get_all_mock(cls):
    for i in range(5):
        track = Track([Note(0, 10, 0)], 100)
        yield Song([track], SongMetadata(f"artist{i}", f"song{i}"))


async def load_song_async_mock(cls, file_path: str):
    track = Track([Note(0, 10, 0)], 100)
    return Song([track], SongMetadata(f"artist{file_path}", f"song{file_path}"))


class MockFileStorage(FileStorage):
    async def initialize(self) -> None:
        raise NotImplementedError()

    def open(self, key, mode):
        raise NotImplementedError()

    def list(self):
        raise NotImplementedError()

    def list_prefix(self, prefix):
        raise NotImplementedError()

    async def read(self, key):
        raise NotImplementedError()

    async def write(self, key, content):
        raise NotImplementedError()


def assert_result(result, expected_len):
    assert len(result) == expected_len
    for i in result:
        assert len(i) == 3
        assert isinstance(i[0], float)
        assert isinstance(i[1], SongMetadata)
        assert isinstance(i[2], Track)


@unittest.mock.patch.object(SongRepository, "list_keys", list_keys_mock)
@unittest.mock.patch.object(SongRepository, "get_all", get_all_mock)
@unittest.mock.patch.object(SongRepository, "load_song_async", load_song_async_mock)
@pytest.mark.asyncio
async def test_find_similar_async():
    repository = SongRepository(MockFileStorage())
    search_engine = SearchEngine(
        repository, TopNoteStrategy(), RelativeIntervalStrategy(), LCSStrategy()
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


@unittest.mock.patch.object(SongRepository, "list_keys", list_keys_mock)
@unittest.mock.patch.object(SongRepository, "get_all", get_all_mock)
@unittest.mock.patch.object(SongRepository, "load_song_async", load_song_async_mock)
@pytest.mark.asyncio
async def test_find_similar():
    repository = SongRepository(MockFileStorage())
    search_engine = SearchEngine(
        repository, TopNoteStrategy(), RelativeIntervalStrategy(), LCSStrategy()
    )
    query = Track([Note(0, 10, 32), Note(30, 10, 32)], 150)
    result1 = search_engine.find_similar(2, query)
    result2 = search_engine.find_similar(3, query)
    result3 = search_engine.find_similar(5, query)
    result4 = search_engine.find_similar(6, query)

    assert_result(result1, 2)
    assert_result(result2, 3)
    assert_result(result3, 5)
    assert_result(result4, 5)
