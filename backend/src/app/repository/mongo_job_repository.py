import logging
from typing import Optional
from pymongo import MongoClient
from app.entity.job import Job, JobStatus
from app.entity.search_result import SearchResult
from app.repository.job_repository import JobRepository
from app.util.mongo_serializer import MongoSerializer
import config

logger = logging.getLogger(config.DEFAULT_LOGGER)


class MongoJobRepository(JobRepository):
    def __init__(self, mongo_url: str) -> None:
        self.mongo_url = mongo_url

    def __get_client(self):
        return MongoClient(self.mongo_url)[config.SONGS_DB][config.JOBS_COLLECTION]

    def get_job(self, id: str) -> Job:
        res = self.__get_client().find_one({"_id": id})
        if not res:
            raise ValueError("Unknown id")
        return MongoSerializer.deserialize_job(res)

    def create_job(self) -> Job:
        status = JobStatus.PENDING
        res = self.__get_client().insert_one({"status": status.value, "results": None})
        job_id = res.inserted_id
        return Job(job_id, status, None)

    def update_job(
        self, id: str, status: JobStatus, results: Optional[list[SearchResult]]
    ) -> None:
        ser_res = None
        if results:
            ser_res = [MongoSerializer.serialize_search_result(i) for i in results]
        self.__get_client().update_one(
            {"_id": id}, {"$set": {"status": status.value, "results": ser_res}}
        )