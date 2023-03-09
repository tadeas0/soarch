from common.repository.job_repository import JobRepository
from common.repository.repository_factory import RepositoryFactory
from common.repository.song_repository import SongRepository
from test.mocks.mock_job_repository import MockJobRepository
from test.mocks.mock_repository import MockRepository


class MockRepositoryFactory(RepositoryFactory):
    def create_job_repository(self) -> JobRepository:
        return MockJobRepository()

    def create_song_repository(self) -> SongRepository:
        return MockRepository()
