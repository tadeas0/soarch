from dataclasses import dataclass
from enum import Enum
from typing import Optional
from app.entity.search_result import SearchResult


class JobStatus(Enum):
    PENDING = "pending"
    COMPLETED = "completed"


@dataclass
class Job:
    id: str
    status: JobStatus
    results: Optional[list[SearchResult]]
