#!/bin/bash
#
# build docker image for local development
#

IMAGE_NAME="carboncms:mongo"

_usage() {
    echo
    echo 'Usage: ./build.sh'
}

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

echo
echo ">>> Build mongo image"
docker build --file "$ROOT_DIR/dockerfile.dev" \
    --tag "$IMAGE_NAME" \
    --build-arg etc_mongo=/etc/mongo \
    --build-arg var_mongo=/var/mongo \
    "$ROOT_DIR"

echo
echo "<<< DONE"
