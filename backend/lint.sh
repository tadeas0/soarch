#!/bin/bash
src_dir="src/app"
mypy $(dirname "$0")/$src_dir --exclude "$(dirname "$0")/$src_dir/venv/*"