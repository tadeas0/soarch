import pytest
import unittest
from app.midi.filestorage import LocalFileStorage


@pytest.fixture
def fake_filesystem(fs):
    fs.create_file("/test_dir/file1.txt")
    fs.create_file("/test_dir/file2.mid")
    fs.create_file("/test_dir/file3")
    fs.create_file("/file4")
    fs.create_file("/test_dir_2/test_dir_3/file5")
    return fs


def test_list(fake_filesystem):
    lfs = LocalFileStorage("/")
    case = unittest.TestCase()
    case.assertCountEqual(
        lfs.list(),
        [
            "test_dir/file1.txt",
            "test_dir/file2.mid",
            "test_dir/file3",
            "file4",
            "test_dir_2/test_dir_3/file5",
        ],
    )


def test_list_prefix(fake_filesystem):
    lfs = LocalFileStorage("/")
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


def test_open(fake_filesystem):
    lfs = LocalFileStorage("/")
    case = unittest.TestCase()
    f1 = lfs.open("new_file.txt", "w")
    f1.write("test_string")
    f1.close()
    f2 = lfs.open("new_file.txt", "r")
    case.assertListEqual(f2.readlines(), ["test_string"])
    f2.close()

    # Test directory creation
    f3 = lfs.open("new_directory/new_file_2.txt", "w")
    f3.write("test_string_2")
    f3.close()
    f4 = lfs.open("new_directory/new_file_2.txt", "r")
    case.assertListEqual(f4.readlines(), ["test_string_2"])
    f4.close()

    # Test nested directory creation
    f5 = lfs.open("new_directory/new_nested_directory/new_file_3.txt", "w")
    f5.write("test_string_3")
    f5.close()
    f6 = lfs.open("new_directory/new_nested_directory/new_file_3.txt", "r")
    case.assertListEqual(f6.readlines(), ["test_string_3"])
    f6.close()

    f7 = lfs.open("test_dir/new_file_4.txt", "w")
    f7.write("test_string_4")
    f7.close()
    f8 = lfs.open("test_dir/new_file_4.txt", "r")
    case.assertListEqual(f8.readlines(), ["test_string_4"])
    f8.close()

    case.assertCountEqual(
        lfs.list(),
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
