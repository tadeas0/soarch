from flask import Flask
import config


app = Flask(__name__)
app.config.from_json("../secrets.json")
app.url_map.strict_slashes = False


from app.midi.controller import midi_bp
from app.health_check.controller import health_check_bp

app.register_blueprint(midi_bp)
app.register_blueprint(health_check_bp)


from app.search_engine.repository import SongRepository
from app.search_engine.search_engine import SearchEngine
from app.search_engine.similarity_strategy import EMDStrategy

repository = SongRepository()
repository.load_directory(config.PROCESSED_MIDI)
search_engine = SearchEngine(repository, EMDStrategy())
