from common.repository.song_repository import SongRepository
from common.entity.song import Note, Song, SongMetadata, Track


class MockRepository(SongRepository):
    def __get_track(self):
        return Track([Note(i * 10, 10, 0) for i in range(8)], 100)

    async def list_keys(self):
        return ["0", "1", "2", "3", "4"]

    def load_song(self, file_path: str):
        track = self.__get_track()
        return Song(
            [track], SongMetadata(f"artist{file_path}", f"song{file_path}", 120)
        )

    def load_song_async(self, file_path: str):
        return self.load_song(file_path)

    def get_all_songs(self):
        for i in range(5):
            track = Track([Note(0, 10, 0)], 100)
            yield Song([track], SongMetadata(f"artist{i}", f"song{i}", 120))

    def insert(self):
        pass

    def insert_many(self):
        pass

    async def get_song_slugs(self) -> list[str]:
        return [f"artist{i} - song{i}" for i in range(5)]

    def upsert(self):
        pass
