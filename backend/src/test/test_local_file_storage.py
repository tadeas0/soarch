import unittest
from pyfakefs.fake_filesystem_unittest import TestCase
from app.midi.filestorage import LocalFileStorage


class TestMidiParser(TestCase):
    def setUp(self):
        self.setUpPyfakefs()
        self.fs.create_file("/test_dir/file1.txt")
        self.fs.create_file("/test_dir/file2.mid")
        self.fs.create_file("/test_dir/file3")
        self.fs.create_file("/file4")
        self.fs.create_file("/test_dir_2/test_dir_3/file5")

    def test_list(self):
        lfs = LocalFileStorage("/")
        self.assertCountEqual(
            lfs.list(),
            [
                "test_dir/file1.txt",
                "test_dir/file2.mid",
                "test_dir/file3",
                "file4",
                "test_dir_2/test_dir_3/file5",
            ],
        )

    def test_list_prefix(self):
        lfs = LocalFileStorage("/")
        self.assertCountEqual(
            lfs.list_prefix("test_dir"),
            [
                "test_dir/file1.txt",
                "test_dir/file2.mid",
                "test_dir/file3",
                "test_dir_2/test_dir_3/file5",
            ],
        )
        self.assertCountEqual(
            lfs.list_prefix("test_dir/"),
            [
                "test_dir/file1.txt",
                "test_dir/file2.mid",
                "test_dir/file3",
            ],
        )
        self.assertCountEqual(
            lfs.list_prefix("test_dir/file1.txt"),
            [
                "test_dir/file1.txt",
            ],
        )
        self.assertCountEqual(
            lfs.list_prefix("some_nonexistent_prefix"),
            [],
        )
        self.assertCountEqual(
            lfs.list_prefix(""),
            [
                "test_dir/file1.txt",
                "test_dir/file2.mid",
                "test_dir/file3",
                "file4",
                "test_dir_2/test_dir_3/file5",
            ],
        )

    def test_open(self):
        lfs = LocalFileStorage("/")
        f1 = lfs.open("new_file.txt", "w")
        f1.write("test_string")
        f1.close()
        f2 = lfs.open("new_file.txt", "r")
        self.assertListEqual(f2.readlines(), ["test_string"])
        f2.close()

        # Test directory creation
        f3 = lfs.open("new_directory/new_file_2.txt", "w")
        f3.write("test_string_2")
        f3.close()
        f4 = lfs.open("new_directory/new_file_2.txt", "r")
        self.assertListEqual(f4.readlines(), ["test_string_2"])
        f4.close()

        # Test nested directory creation
        f5 = lfs.open("new_directory/new_nested_directory/new_file_3.txt", "w")
        f5.write("test_string_3")
        f5.close()
        f6 = lfs.open("new_directory/new_nested_directory/new_file_3.txt", "r")
        self.assertListEqual(f6.readlines(), ["test_string_3"])
        f6.close()

        f7 = lfs.open("test_dir/new_file_4.txt", "w")
        f7.write("test_string_4")
        f7.close()
        f8 = lfs.open("test_dir/new_file_4.txt", "r")
        self.assertListEqual(f8.readlines(), ["test_string_4"])
        f8.close()

        self.assertCountEqual(
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


if __name__ == "__main__":
    unittest.main()
