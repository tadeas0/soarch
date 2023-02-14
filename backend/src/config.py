import os

MIDI_CHANNELS = 16
MIDI_NOTES = 128
MIDI_DIR = "../dataset"
RAW_MIDI_PREFIX = "raw"
PROCESSED_MIDI_PREFIX = "processed"
PROCESSED_EXAMPLE_PREFIX = "example/processed"
RAW_EXAMPLE_PREFIX = "example/raw"
ROBS_PREFIX = "robs"
FREEMIDI_PREFIX = "freemidi"
QUERY_PREFIX = "query"
VELOCITY_THRESHOLD = 0
DEFAULT_PPQ = 480
MEASURE_LENGTH = DEFAULT_PPQ * 4
CLOUD_STORAGE_CREDENTIALS = os.getenv("CLOUD_STORAGE_CREDENTIALS", "")
BUCKET_NAME = os.getenv("BUCKET_NAME", "")
REDIS_URL = os.getenv("REDIS_URL", "")
ENV = os.getenv("ENV", "prod")
DEFAULT_LOGGER = "midi-search"
SCRAPER_LOGGER = "scraper"
DEFAULT_STRATEGY = "lcs"
REDIS_CACHE_URL = os.getenv("REDIS_CACHE_URL", "")
REDIS_QUEUE_URL = os.getenv("REDIS_QUEUE_URL", "")
PROCESS_COUNT = int(os.getenv("PROCESS_COUNT", 4))
MONGODB_URL = os.getenv("MONGODB_URL", "")
SONGS_DB = "songs_db"
SONGS_COLLECTION = "songs_collection"
