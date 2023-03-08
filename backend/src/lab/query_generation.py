import os
import pickle
import random
from common.entity.example_query import ExampleQuery

import config
import matplotlib.pyplot as plt
from common.repository.file_song_repository import FileSongRepository
from common.search_engine.strategy.segmentation_strategy import FixedLengthStrategy
from common.util.filestorage.local_file_storage import LocalFileStorage
from miditoolkit import notes2pianoroll, plot, Note as MTKNote
from common.entity.song import Note
import uuid

RANDOM_SEED = 123


async def __get_all_segments():
    file_storage = LocalFileStorage(
        os.path.join(config.MIDI_DIR, config.PROCESSED_MIDI_PREFIX)
    )
    repository = FileSongRepository(file_storage)
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
            f"Segment ({index + 1}/{len(annotated_segments)}),"
            f"already saved: {already_saved}"
        )

        mtk_notes = [
            MTKNote(50, i.pitch, i.time, i.time + i.length) for i in segment.track.notes
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
            save = input("Save this query? (y/n) type x for e(x)it: ")
        if save == "y":
            print(
                f"Saving query - song: {segment.metadata.artist}"
                f"- {segment.metadata.name}"
            )
            obj = pickle.dumps(segment)
            file_name = f"{str(uuid.uuid4())}.pkl"
            await query_fs.write(file_name, obj)
            already_saved += 1
        if save == "x":
            break


def __randomise_pitch(note: Note) -> Note:
    max_pitch_shift = 12
    shift = random.randint(1, max_pitch_shift)
    sign = random.choice([-1, 1])
    new_pitch = max(0, min(note.pitch + (sign * shift), config.MIDI_NOTES))
    return Note(note.time, note.length, new_pitch)


async def generate_shifted_queries():
    query_fs = LocalFileStorage(os.path.join(config.MIDI_DIR, config.QUERY_PREFIX))
    keys = query_fs.list_all()
    random.seed(RANDOM_SEED)
    for shift_notes in range(1, 6):
        target_fs = LocalFileStorage(
            os.path.join(
                config.MIDI_DIR, config.QUERY_PREFIX, f"{shift_notes}_notes_changed"
            )
        )
        for k in keys:
            example_query: ExampleQuery = pickle.loads(await query_fs.read(k))
            new_notes = example_query.track.notes
            shift_indexes = random.choices(
                range(len(new_notes)), k=min(len(new_notes), shift_notes)
            )
            for i in shift_indexes:
                new_notes[i] = __randomise_pitch(new_notes[i])
            example_query.track.notes = new_notes
            file_name = f"{str(uuid.uuid4())}.pkl"
            obj = pickle.dumps(example_query)
            await target_fs.write(file_name, obj)


async def generate_transposed_queries():
    random.seed(RANDOM_SEED)
    max_transpo = 12
    for shift_notes in range(6):
        query_fs = LocalFileStorage(
            os.path.join(
                config.MIDI_DIR, config.QUERY_PREFIX, f"{shift_notes}_notes_changed"
            )
        )
        target_fs = LocalFileStorage(
            os.path.join(
                config.MIDI_DIR,
                config.QUERY_PREFIX,
                f"{shift_notes}_notes_changed_transposed",
            )
        )
        keys = query_fs.list_all()
        for k in keys:
            example_query: ExampleQuery = pickle.loads(await query_fs.read(k))
            new_notes = example_query.track.notes
            if bool(random.getrandbits(1)):
                max_shift = config.MIDI_NOTES - max((n.pitch for n in new_notes))
                shift = random.randint(1, min(max_transpo, max_shift))
                new_notes = [Note(n.time, n.length, n.pitch + shift) for n in new_notes]
            else:
                max_shift = min((n.pitch for n in new_notes))
                shift = random.randint(1, min(max_shift, max_transpo))
                new_notes = [Note(n.time, n.length, n.pitch - shift) for n in new_notes]
            example_query.track.notes = new_notes
            file_name = f"{str(uuid.uuid4())}.pkl"
            obj = pickle.dumps(example_query)
            await target_fs.write(file_name, obj)
