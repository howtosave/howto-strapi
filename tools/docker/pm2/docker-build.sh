#!/bin/bash

_SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
WORKDIR="$_SCRIPT_DIR"
ROOTDIR="$_SCRIPT_DIR/../../.."
# prod or dev
ENV="$1"

if [ "$ENV" == "prod" ]; then
  echo
  echo ">>> Build image for production mode"
  echo
  docker build --file "${WORKDIR}/dockerfile" \
    --tag howto:pm2 \
    --build-arg volume_ro=/volume-ro \
    --build-arg volume_rw=/volume-rw \
    ${ROOTDIR}
else
  echo
  echo ">>> Build image for development mode"
  echo
  docker build --file "${WORKDIR}/dockerfile.dev" \
    --tag howto:pm2_dev \
    --build-arg volume_ro=/volume-ro \
    --build-arg volume_rw=/volume-rw \
    ${ROOTDIR}
fi
