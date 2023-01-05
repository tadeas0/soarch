from app.midi.repository.file_repository import FileRepository
import config
from app.util.filestorage import FileStorage, GoogleCloudFileStorage, LocalFileStorage
import json
from app.util.logging import setup_logging

if config.CLOUD_STORAGE_CREDENTIALS:
    file_storage: FileStorage = GoogleCloudFileStorage(
        json.loads(config.CLOUD_STORAGE_CREDENTIALS),
        config.BUCKET_NAME,
        config.REDIS_CACHE_URL,
    )
else:
    file_storage = LocalFileStorage(config.MIDI_DIR)

repository = FileRepository(file_storage)
