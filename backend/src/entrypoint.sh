#!/bin/bash
export PYTHONPATH=$PYTHONPATH:/app/src
poetry run python -m src.create_db
exec "$@"