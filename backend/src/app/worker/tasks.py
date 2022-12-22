import dramatiq
from app.util.parser.json_parser import JsonParser
from app.search_engine.search_engine_factory import SearchEngineFactory
from . import repository
import config
from app.midi.serializer import TrackSerializer
import asyncio


@dramatiq.actor(store_results=True, max_retries=0)
def search(data):
    song = JsonParser.parse(data)
    similarity_strategy = data.get("similarityStrategy", config.DEFAULT_STRATEGY)
    engine = SearchEngineFactory.create_search_engine(repository, similarity_strategy)

    loop = asyncio.new_event_loop()
    similar_songs = loop.run_until_complete(
        engine.find_similar_async(10, song.tracks[0])
    )
    serialized_songs = [
        TrackSerializer.serialize_with_metadata(i[1], i[2]) for i in similar_songs
    ]
    return serialized_songs
