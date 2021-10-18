#!/bin/bash
src_dir="src/"
flake8 $(dirname "$0")/$src_dir
mypy $(dirname "$0")/$src_dir
