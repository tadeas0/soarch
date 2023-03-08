from http import HTTPStatus
from quart import Blueprint, request, jsonify
from app.midi.serializer import TrackSerializer
from worker.tasks import search
from app import job_repository
import logging
import config


logger = logging.getLogger(config.DEFAULT_LOGGER)
midi_bp = Blueprint("midi", __name__, url_prefix="/api/midi")


@midi_bp.post("/")
async def midi_post():
    data = await request.get_json()

    if not data:
        raise TypeError()

    job = job_repository.create_job()
    logger.debug(f"created job {job}")
    search.send(data, job.id)
    results = None
    if job.results is not None:
        results = [TrackSerializer.serialize_search_result(i) for i in job.results]
    return jsonify({"id": job.id, "status": job.status.value, "results": results})


@midi_bp.get("/<id>")
async def midi_get(id: str):
    job = job_repository.get_job(id)
    results = None
    if job.results is not None:
        results = [TrackSerializer.serialize_search_result(i) for i in job.results]
    return jsonify({"id": job.id, "status": job.status.value, "results": results})


@midi_bp.errorhandler(KeyError)
@midi_bp.errorhandler(TypeError)
def handle_key_error(e):
    logger.debug("Recieved invalid data format")
    return "Invalid data format", HTTPStatus.BAD_REQUEST
