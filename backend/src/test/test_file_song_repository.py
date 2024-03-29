import unittest
import pytest
from common.repository.file_song_repository import FileSongRepository
from common.entity.song import Note, Song, SongMetadata, Track
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


@pytest.mark.asyncio
async def test_get_song_slugs():
    case = unittest.TestCase()
    fs = MockFileStorage()
    test_songs = [
        Song([Track([Note(1, 1, 1)], 1)], SongMetadata("artist1", "name1", 1)),
        Song([Track([Note(2, 2, 2)], 2)], SongMetadata("artist2", "name2", 2)),
    ]
    repo = FileSongRepository(fs)
    await repo.insert_many(test_songs)
    case.assertCountEqual(
        await repo.get_song_slugs(), ["artist1 - name1", "artist2 - name2"]
    )


@pytest.mark.asyncio
async def test_upsert():
    fs = MockFileStorage()
    test_songs = [
        Song([Track([Note(1, 1, 1)], 1)], SongMetadata("artist1", "name1", 1)),
        Song([Track([Note(2, 2, 2)], 2)], SongMetadata("artist2", "name2", 2)),
    ]
    repo = FileSongRepository(fs)
    await repo.insert_many(test_songs)
    await repo.upsert(
        "artist1 - name1.pkl",
        Song([Track([Note(1, 2, 3)], 4)], SongMetadata("newartist", "newname", 1)),
    )
    await repo.upsert(
        "artist3 - name3.pkl",
        Song(
            [Track([], 10)],
            SongMetadata("newartist2", "newname2", 1),
        ),
    )
    assert repo.load_song("artist1 - name1.pkl") == Song(
        [Track([Note(1, 2, 3)], 4)], SongMetadata("newartist", "newname", 1)
    )
    assert repo.load_song("artist3 - name3.pkl") == Song(
        [Track([], 10)], SongMetadata("newartist2", "newname2", 1)
    )
