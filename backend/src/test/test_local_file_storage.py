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


@pytest.mark.asyncio
async def test_read_all_prefix(my_tmpdir):
    lfs = LocalFileStorage(str(my_tmpdir.realpath()))
    case = unittest.TestCase()

    await lfs.write("pref1_a.txt", b"pref1_a")
    await lfs.write("pref1_b.txt", b"pref1_b")
    await lfs.write("pref1_c.txt", b"pref1_c")
    await lfs.write("dir/pref2_a.txt", b"pref2_a")
    await lfs.write("dir/pref2_b.txt", b"pref2_b")
    case.assertCountEqual(
        await lfs.read_all_prefix("pref1"),
        [
            ("pref1_a.txt", b"pref1_a"),
            ("pref1_b.txt", b"pref1_b"),
            ("pref1_c.txt", b"pref1_c"),
        ],
    )
    case.assertCountEqual(
        await lfs.read_all_prefix("dir"),
        [("dir/pref2_a.txt", b"pref2_a"), ("dir/pref2_b.txt", b"pref2_b")],
    )
    case.assertCountEqual(
        await lfs.read_all_prefix("dir/pref2_a"),
        [("dir/pref2_a.txt", b"pref2_a")],
    )
    case.assertCountEqual(await lfs.read_all_prefix("empty"), [])


@pytest.mark.asyncio
async def test_read_all_keys(my_tmpdir):
    lfs = LocalFileStorage(str(my_tmpdir.realpath()))
    case = unittest.TestCase()

    await lfs.write("pref1_a.txt", b"pref1_a")
    await lfs.write("pref1_b.txt", b"pref1_b")
    await lfs.write("pref1_c.txt", b"pref1_c")
    await lfs.write("dir/pref2_a.txt", b"pref2_a")
    await lfs.write("dir/pref2_b.txt", b"pref2_b")

    r1 = await lfs.read_all_keys(["pref1_a.txt", "pref1_b.txt", "pref1_c.txt"])
    r2 = await lfs.read_all_keys(["dir/pref2_a.txt", "dir/pref2_b.txt"])
    r3 = await lfs.read_all_keys(["dir/pref2_a.txt"])

    case.assertCountEqual(
        r1,
        [
            ("pref1_a.txt", b"pref1_a"),
            ("pref1_b.txt", b"pref1_b"),
            ("pref1_c.txt", b"pref1_c"),
        ],
    )
    case.assertCountEqual(
        r2,
        [("dir/pref2_a.txt", b"pref2_a"), ("dir/pref2_b.txt", b"pref2_b")],
    )
    case.assertCountEqual(r3, [("dir/pref2_a.txt", b"pref2_a")])

    with pytest.raises(FileNotFoundError):
        await lfs.read_all_keys(["empty"])
