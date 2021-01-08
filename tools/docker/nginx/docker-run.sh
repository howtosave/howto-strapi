#!/bin/bash

LOCAL_PORT=8010

_SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ROOTDIR="$_SCRIPT_DIR"

# make log directory
mkdir -p "$ROOTDIR/log/nginx"

# prod or dev
ENV="$1"

if [ "$ENV" == "prod" ]; then
  echo
  echo ">>> Run image in production mode. local port: $LOCAL_PORT"
  echo
  # run with temp container
  docker run --rm -it --name nginx-prod -p $LOCAL_PORT:80 \
    --mount type=bind,source="$ROOTDIR",target=/volume-ro,readonly \
    --mount type=bind,source="$ROOTDIR",target=/volume-rw \
    howto:nginx
else
  echo
  echo ">>> Run image in development mode. local port: $LOCAL_PORT"
  echo
  # run with temp container
  docker run --rm -it --name nginx-dev -p $LOCAL_PORT:80 \
    --mount type=bind,source="$ROOTDIR",target=/volume-ro,readonly \
    --mount type=bind,source="$ROOTDIR",target=/volume-rw \
    howto:nginx_dev
fi

# check
# curl -s http://localhost:$LOCAL_PORT | grep 'ok'
