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
  # check network
  docker network inspect br10 > /dev/null
  if [ "$?" != "0" ]; then
    # create network
    docker network create \
      --driver=bridge \
      --subnet=10.0.0.0/8 \
      --ip-range=10.255.255.255/8 \
      --gateway=10.0.0.1 \
      br10
  fi
  # run with temp container
  docker run --rm -it --network br10 --ip 10.0.0.3 --name nginx-dev -p $LOCAL_PORT:80 \
    --mount type=bind,source="$ROOTDIR",target=/volume-ro,readonly \
    --mount type=bind,source="$ROOTDIR",target=/volume-rw \
    howto:nginx_dev
fi

# check
# curl -s http://localhost:$LOCAL_PORT | grep 'ok'
