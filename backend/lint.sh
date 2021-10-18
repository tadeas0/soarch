#!/bin/bash
src_dir="src/app"
flake8 $(dirname "$0")/$src_dir
mypy $(dirname "$0")/$src_dir
