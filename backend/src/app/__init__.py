from flask import Flask
import config
from app.midi.repository import SongRepository
from app.search_engine.search_engine import SearchEngine
from app.search_engine.similarity_strategy import DTWStrategy

from app.search_engine.melody_extraction_strategy import TopNoteStrategy
from app.search_engine.standardization_strategy import RelativeIntervalStrategy

repository = SongRepository()
engine = SearchEngine(
    repository, TopNoteStrategy(), RelativeIntervalStrategy(), DTWStrategy()
)


def create_app():
    app = Flask(__name__)
    app.config.from_json("../secrets.json")
    app.url_map.strict_slashes = False

    repository.load_directory(config.PROCESSED_MIDI)

    from app.midi.controller import midi_bp
    from app.health_check.controller import health_check_bp

    app.register_blueprint(midi_bp)
    app.register_blueprint(health_check_bp)

    from app.scripts.parse_to_db import parse_to_db
    from app.scripts.scrape_robs_library import scrape_robs_library
    from app.scripts.scrape_freemidi import scrape_freemidi

    app.cli.add_command(parse_to_db)
    app.cli.add_command(scrape_freemidi)
    app.cli.add_command(scrape_robs_library)

    return app
