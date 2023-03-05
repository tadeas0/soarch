from app.midi.repository.song_repository import SongRepository
from app.util.song import Note, Song, SongMetadata, Track


class MockRepository(SongRepository):
    def __get_track(self):
        return Track([Note(i * 10, 10, 0) for i in range(8)], 100)

    async def list_keys(self):
        return ["0", "1", "2", "3", "4"]

    def load_song(self, file_path: str):
        track = self.__get_track()
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
