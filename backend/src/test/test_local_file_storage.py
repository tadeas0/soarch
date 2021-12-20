import pytest
import unittest
import unittest.mock
from app.util.filestorage import LocalFileStorage


@pytest.fixture
def my_tmpdir(tmpdir):
    d1 = tmpdir.mkdir("test_dir")
    d1.join("file1.txt").write("")
    d1.join("file2.mid").write("")
    d1.join("file3").write("")
    tmpdir.join("file4").write("")
    tmpdir.mkdir("test_dir_2").mkdir("test_dir_3").join("file5").write("")
    return tmpdir


def test_list(my_tmpdir):
    lfs = LocalFileStorage(str(my_tmpdir.realpath()))
    case = unittest.TestCase()
    case.assertCountEqual(
        lfs.list_all(),
        [
            "test_dir/file1.txt",
            "test_dir/file2.mid",
            "test_dir/file3",
            "file4",
            "test_dir_2/test_dir_3/file5",
        ],
    )


def test_list_prefix(my_tmpdir):
    lfs = LocalFileStorage(str(my_tmpdir.realpath()))
    case = unittest.TestCase()
    case.assertCountEqual(
        lfs.list_prefix("test_dir"),
        [
            "test_dir/file1.txt",
            "test_dir/file2.mid",
            "test_dir/file3",
            "test_dir_2/test_dir_3/file5",
        ],
    )
    case.assertCountEqual(
        lfs.list_prefix("test_dir/"),
        [
            "test_dir/file1.txt",
            "test_dir/file2.mid",
            "test_dir/file3",
        ],
    )
    case.assertCountEqual(
        lfs.list_prefix("test_dir/file1.txt"),
        [
            "test_dir/file1.txt",
        ],
    )
    case.assertCountEqual(
        lfs.list_prefix("some_nonexistent_prefix"),
        [],
    )
    case.assertCountEqual(
        lfs.list_prefix(""),
        [
            "test_dir/file1.txt",
            "test_dir/file2.mid",
            "test_dir/file3",
            "file4",
            "test_dir_2/test_dir_3/file5",
        ],
    )


@pytest.mark.asyncio
async def test_write(my_tmpdir):
    lfs = LocalFileStorage(str(my_tmpdir.realpath()))
    case = unittest.TestCase()

    await lfs.write("new_file.txt", b"test_string")
    assert await lfs.read("new_file.txt") == b"test_string"

    # Test directory creation
    await lfs.write("new_directory/new_file_2.txt", b"test_string_2")
    assert await lfs.read("new_directory/new_file_2.txt") == b"test_string_2"

    # Test nested directory creation
    await lfs.write(
        "new_directory/new_nested_directory/new_file_3.txt", b"test_string_3"
    )
    assert (
        await lfs.read("new_directory/new_nested_directory/new_file_3.txt")
        == b"test_string_3"
    )

    await lfs.write("test_dir/new_file_4.txt", b"test_string_4")
    assert await lfs.read("test_dir/new_file_4.txt") == b"test_string_4"

    case.assertCountEqual(
        lfs.list_all(),
        [
            "test_dir/file1.txt",
            "test_dir/file2.mid",
            "test_dir/file3",
            "file4",
            "test_dir_2/test_dir_3/file5",
            "new_file.txt",
            "new_directory/new_file_2.txt",
            "new_directory/new_nested_directory/new_file_3.txt",
            "test_dir/new_file_4.txt",
        ],
    )
