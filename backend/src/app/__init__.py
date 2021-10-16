from flask import Flask


app = Flask(__name__)
app.config.from_json("../secrets.json")


from app.midi.controller import midi_bp
from app.health_check.controller import health_check_bp

app.register_blueprint(midi_bp)
app.register_blueprint(health_check_bp)
