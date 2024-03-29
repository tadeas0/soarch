from typing import Optional
from common.entity.job import Job, JobStatus
from common.entity.search_result import SearchResult
from common.entity.song import Note, SongMetadata, Track
from common.repository.job_repository import JobRepository


class MockJobRepository(JobRepository):
    def get_job(self, id: str) -> Job:
        return Job(
            id,
            JobStatus.COMPLETED,
            [
                SearchResult(
                    SongMetadata("artist", "name", 99), 1.5, Track([Note(1, 2, 3)], 10)
                )
            ],
        )

    def create_job(self) -> Job:
        return Job("1", JobStatus.PENDING, None)

    def update_job(
        self, id: str, status: JobStatus, results: Optional[list[SearchResult]]
    ) -> None:
        pass
