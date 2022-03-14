#!/bin/bash

_SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ROOTDIR="$_SCRIPT_DIR"
# prod or dev
ENV="$1"

if [ "$ENV" == "prod" ]; then
  echo
  echo ">>> Build image for production mode"
  echo
  docker build --file "${ROOTDIR}/dockerfile" \
    --tag howto:nginx \
    --build-arg volume_ro=/volume-ro \
    --build-arg volume_rw=/volume-rw \
    ${ROOTDIR}
else
  echo
  echo ">>> Build image for development mode"
  echo
  docker build --file "${ROOTDIR}/dockerfile.dev" \
    --tag howto:nginx_dev \
    --build-arg volume_ro=/volume-ro \
    --build-arg volume_rw=/volume-rw \
    ${ROOTDIR}
fi
