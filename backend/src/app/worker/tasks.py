import dramatiq
from common.entity.job import JobStatus
from common.util.parser.json_parser import JsonParser
from common.search_engine.search_engine_factory import SearchEngineFactory
from . import repository, job_repository
import config
import asyncio


@dramatiq.actor(max_retries=0)
def search(data: dict, job_id: str):
    song = JsonParser.parse(data)
    similarity_strategy = data.get("similarityStrategy", config.DEFAULT_STRATEGY)
    use_n_gram_prep = data.get("useFasterSearch", config.USE_N_GRAM_PREP)
    engine = SearchEngineFactory.create_search_engine(
        repository, similarity_strategy, use_n_gram_prep
    )

    loop = asyncio.new_event_loop()
    similar_songs = loop.run_until_complete(
        engine.find_similar_async(10, song.tracks[0])
    )
    job_repository.update_job(job_id, JobStatus.COMPLETED, similar_songs)
