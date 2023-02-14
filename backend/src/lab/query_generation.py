import os
import pickle
import random
from lab.example_query import ExampleQuery

import config
import matplotlib.pyplot as plt
from app.midi.repository.file_repository import FileRepository
from app.search_engine.strategy.segmentation_strategy import FixedLengthStrategy
from app.util.filestorage.local_file_storage import LocalFileStorage
from miditoolkit import Note, notes2pianoroll, plot
import uuid

RANDOM_SEED = 123


async def __get_all_segments():
    file_storage = LocalFileStorage(
        os.path.join(config.MIDI_DIR, config.PROCESSED_MIDI_PREFIX)
    )
    repository = FileRepository(file_storage)
    songs = [i async for i in repository.get_all_songs()]
    songs.sort(
        key=lambda a: a.metadata.artist + " - " + a.metadata.name if a.metadata else ""
    )
    segmentation = FixedLengthStrategy()
    annotated_segments: list[ExampleQuery] = []
    for song in songs:
        if not song.metadata:
            continue
        for track in song.tracks:
            s = segmentation.segment(track, config.MEASURE_LENGTH * 2)
            ann_seg = [ExampleQuery(song.metadata, i) for i in s]
            annotated_segments.extend(ann_seg)
    return annotated_segments


async def generate_queries():
    annotated_segments = await __get_all_segments()
    query_fs = LocalFileStorage(os.path.join(config.MIDI_DIR, config.QUERY_PREFIX))
    random.seed(RANDOM_SEED)
    random.shuffle(annotated_segments)

    already_saved = 0
    for index, segment in enumerate(annotated_segments):
        print(
            f"Segment ({index + 1}/{len(annotated_segments)}), already saved: {already_saved}"
        )

        mtk_notes = [
            Note(50, i.pitch, i.time, i.time + i.length) for i in segment.track.notes
        ]
        pianoroll = notes2pianoroll(
            mtk_notes,
            ticks_per_beat=config.DEFAULT_PPQ,
            max_tick=config.MEASURE_LENGTH * 2,
        )
        plot(
            pianoroll,
            beat_resolution=config.DEFAULT_PPQ,
        )
        plt.show()
        save = ""
        while save != "y" and save != "n" and save != "x":
            save = input(f"Save this query? (y/n) type x for e(x)it: ")
        if save == "y":
            print(
                f"Saving query - song: {segment.metadata.artist} - {segment.metadata.name}"
            )
            obj = pickle.dumps(segment)
            file_name = f"{str(uuid.uuid4())}.pkl"
            await query_fs.write(file_name, obj)
            already_saved += 1
        if save == "x":
            break
