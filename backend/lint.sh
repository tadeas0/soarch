#!/bin/bash
src_dir="src/"
flake8 $(dirname "$0")/$src_dir --config setup.cfg
mypy $(dirname "$0")/$src_dir --config setup.cfg
