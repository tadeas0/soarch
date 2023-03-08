from common.repository.job_repository import JobRepository
from common.repository.mongo_job_repository import MongoJobRepository
from common.repository.mongo_song_repository import MongoSongRepository
from common.repository.repository_factory import RepositoryFactory
from common.repository.song_repository import SongRepository
import common.config as config


class MongoRepositoryFactory(RepositoryFactory):
    def create_job_repository(self) -> JobRepository:
        return MongoJobRepository(config.MONGODB_URL)

    def create_song_repository(self) -> SongRepository:
        return MongoSongRepository(config.MONGODB_URL)
