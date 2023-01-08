from app.midi.repository.file_repository import FileRepository
from app.midi.repository.repository import SongRepository
from app.midi.repository.mongo_repository import MongoRepository
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

if config.MONGODB_URL:
    repository: SongRepository = MongoRepository(config.MONGODB_URL)
else:
    repository = FileRepository(file_storage)
