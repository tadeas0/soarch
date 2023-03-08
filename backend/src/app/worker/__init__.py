from common.repository.job_repository import JobRepository
from common.repository.mongo_job_repository import MongoJobRepository
from common.repository.song_repository import SongRepository
from common.repository.mongo_song_repository import MongoSongRepository
import config
from app.util.filestorage import FileStorage, GoogleCloudFileStorage, LocalFileStorage
import json
import os

if config.CLOUD_STORAGE_CREDENTIALS:
    file_storage: FileStorage = GoogleCloudFileStorage(
        json.loads(config.CLOUD_STORAGE_CREDENTIALS),
        config.BUCKET_NAME,
        config.REDIS_CACHE_URL,
        config.PROCESSED_MIDI_PREFIX,
    )
else:
    file_storage = LocalFileStorage(
        os.path.join(config.MIDI_DIR, config.PROCESSED_MIDI_PREFIX)
    )

job_repository: JobRepository = MongoJobRepository(config.MONGODB_URL)
repository: SongRepository = MongoSongRepository(config.MONGODB_URL)
