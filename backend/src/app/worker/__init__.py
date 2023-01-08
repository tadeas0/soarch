from app.midi.repository.file_repository import FileRepository
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

repository = FileRepository(file_storage)
