from abc import ABC, abstractmethod

from typing import Optional

from app.entity.job import Job, JobStatus
from app.entity.search_result import SearchResult


class JobRepository(ABC):
    @abstractmethod
    def get_job(self, id: str) -> Job:
        pass

    @abstractmethod
    def create_job(self) -> Job:
        pass

    @abstractmethod
    def update_job(
        self, id: str, status: JobStatus, results: Optional[list[SearchResult]]
    ) -> None:
        pass
