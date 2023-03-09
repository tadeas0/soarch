from abc import ABC, abstractmethod
from common.repository.job_repository import JobRepository
from common.repository.song_repository import SongRepository


class RepositoryFactory(ABC):
    @abstractmethod
    def create_song_repository(self) -> SongRepository:
        pass

    @abstractmethod
    def create_job_repository(self) -> JobRepository:
        pass
