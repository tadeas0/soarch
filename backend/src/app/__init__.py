from flask import Flask
import config


app = Flask(__name__)
app.config.from_json("../secrets.json")
app.url_map.strict_slashes = False


from app.search_engine.repository import SongRepository
from app.search_engine.search_engine import SearchEngine
from app.search_engine.similarity_strategy import (
    DTWStrategy,
    EMDStrategy,
    LCSStrategy,
    LocalAlignmentStrategy,
)

from app.search_engine.melody_extraction_strategy import TopNoteStrategy
from app.search_engine.standardization_strategy import (
    RelativeIntervalStrategy,
    StandardizationStrategy,
)

repository = SongRepository()
repository.load_directory(config.PROCESSED_MIDI)
engine = SearchEngine(
    repository, TopNoteStrategy(), RelativeIntervalStrategy(), DTWStrategy()
)

from app.midi.controller import midi_bp
from app.health_check.controller import health_check_bp

app.register_blueprint(midi_bp)
app.register_blueprint(health_check_bp)
