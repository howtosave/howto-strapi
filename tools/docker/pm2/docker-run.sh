#!/bin/bash

HOST_PORT=1337
LOCAL_PORT=1337

_SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
WORKDIR="$_SCRIPT_DIR"
ROOTDIR="$_SCRIPT_DIR/../../.."

# make directories
mkdir -p "$WORKDIR/log/pm2"
mkdir -p "$WORKDIR/upload"

# prod or dev
ENV="$1"

if [ "$ENV" == "prod" ]; then
  echo
  echo ">>> Run image in production mode. local:host port => $LOCAL_PORT:$HOST_PORT"
  echo
  # run with temp container
  docker run --rm -it --name pm2-test -p $LOCAL_PORT:$HOST_PORT \
    -e NODE_ENV=production -e PORT=$HOST_PORT --expose $HOST_PORT \
    --mount type=bind,source="$WORKDIR",target=/volume-ro,readonly \
    --mount type=bind,source="$WORKDIR",target=/volume-rw \
    howto:pm2
else
  echo
  echo ">>> Run image in development mode. local:host port => $LOCAL_PORT:$HOST_PORT"
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
  docker run --rm -it --network host --name pm2-dev -p $LOCAL_PORT:$HOST_PORT \
    -e NODE_ENV=development -e PORT=$HOST_PORT --expose $HOST_PORT \
    --mount type=bind,source="$ROOTDIR",target=/workdir \
    --mount type=bind,source="$WORKDIR",target=/volume-ro,readonly \
    --mount type=bind,source="$WORKDIR",target=/volume-rw \
    howto:pm2_dev
fi
