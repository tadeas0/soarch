import config
from app.util.filestorage import FileStorage, GoogleCloudFileStorage, LocalFileStorage
from app.midi.repository import SongRepository
import json

if config.CLOUD_STORAGE_CREDENTIALS:
    file_storage: FileStorage = GoogleCloudFileStorage(
        json.loads(config.CLOUD_STORAGE_CREDENTIALS),
        config.BUCKET_NAME,
        config.REDIS_CACHE_URL,
    )
else:
    file_storage = LocalFileStorage(config.MIDI_DIR)

repository = SongRepository(file_storage)
