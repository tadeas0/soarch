from abc import ABC, abstractmethod


class JobRepository(ABC):
    @abstractmethod
    def get_job(self, id: int) -> None:
        pass
