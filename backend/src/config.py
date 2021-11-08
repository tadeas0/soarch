import os

MIDI_CHANNELS = 16
MIDI_NOTES = 128
ROBS_MIDI_LIB_URL = "http://www.storth.com/midi"
MIDI_DIR = "../midi_files"
RAW_MIDI_PREFIX = "raw"
PROCESSED_MIDI_PREFIX = "processed"
RAW_SIMPLE_MIDI_PREFIX = "simple_raw"
PROCESSED_SIMPLE_MIDI_PREFIX = "../midi_files/simple_processed"
VELOCITY_THRESHOLD = 0
DEFAULT_PPQ = 480
MEASURE_LENGTH = DEFAULT_PPQ * 4
CLOUD_STORAGE_CREDENTIALS = os.getenv("CLOUD_STORAGE_CREDENTIALS", "")
BUCKET_NAME = os.getenv("BUCKET_NAME", "")
REDIS_URL = os.getenv("REDIS_URL", "")
ENV = os.getenv("ENV", "prod")
DEFAULT_LOGGER = "midi-search"
