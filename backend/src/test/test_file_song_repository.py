import unittest
import pytest
from app.repository.file_song_repository import FileSongRepository
from app.entity.song import Note, Song, SongMetadata, Track
from test.mocks.mock_file_storage import MockFileStorage


@pytest.mark.asyncio
async def test_insert():
    fs = MockFileStorage()
    test_song = Song([Track([Note(1, 1, 1)], 1)], SongMetadata("artist1", "name1", 1))
    repo = FileSongRepository(fs)

    await repo.insert(test_song)
    assert await repo.list_keys() == ["artist1 - name1.pkl"]
    assert repo.load_song("artist1 - name1.pkl") == test_song
    assert await repo.load_song_async("artist1 - name1.pkl") == test_song
    assert [i async for i in repo.get_all_songs()] == [test_song]


@pytest.mark.asyncio
async def test_insert_many():
    case = unittest.TestCase()
    fs = MockFileStorage()
    test_songs = [
        Song([Track([Note(1, 1, 1)], 1)], SongMetadata("artist1", "name1", 1)),
        Song([Track([Note(2, 2, 2)], 2)], SongMetadata("artist2", "name2", 2)),
    ]
    repo = FileSongRepository(fs)

    await repo.insert_many(test_songs)
    case.assertCountEqual(
        await repo.list_keys(), ["artist1 - name1.pkl", "artist2 - name2.pkl"]
    )
    assert repo.load_song("artist1 - name1.pkl") == test_songs[0]
    assert repo.load_song("artist2 - name2.pkl") == test_songs[1]
    assert await repo.load_song_async("artist1 - name1.pkl") == test_songs[0]
    assert await repo.load_song_async("artist2 - name2.pkl") == test_songs[1]
    case.assertCountEqual([i async for i in repo.get_all_songs()], test_songs)
