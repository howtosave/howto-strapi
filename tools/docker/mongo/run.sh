#!/bin/bash
#
# run docker image for local development
#

CONTAINRER_NAME="carboncms-mongo-dev"
IMAGE_NAME="carboncms:mongo"
LOCAL_BIND_PORT=17017

_usage() {
    echo
    echo 'Usage: ./run.sh <run_params>'
    echo '  <run_params>   params for docker-run'
    echo '      --rm       run with temp container(default)'
    echo '      --detach   run in background and print container ID'
    echo
    echo ' to start an interactive shell for the running container'
    echo '    $ docker exec -it mongo-dev bash'
    echo
    echo ' to verify a mongodb connection'
    echo '    $ mongo --verbose mongodb://myroot:myroot00@localhost:17017/admin'
}

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
DATA_DIR="$ROOT_DIR/volume/var/mongo"

#
# arguments
#
_OPTS="--rm ${@}"

# check local directories
[ ! -d "$DATA_DIR/data" ] && mkdir -p "$DATA_DIR/data"
[ ! -d "$DATA_DIR/log" ] && mkdir -p "$DATA_DIR/log"
[ ! -d "$DATA_DIR/run" ] && mkdir -p "$DATA_DIR/run"

docker run $_OPTS --name $CONTAINRER_NAME -p $LOCAL_BIND_PORT:27017 \
    --mount type=bind,source="$ROOT_DIR/volume/etc-mongo",target=/etc/mongo,readonly \
    --mount type=bind,source="$DATA_DIR/data",target=/data/db \
    --mount type=bind,source="$DATA_DIR",target=/var/mongo \
    -e MONGO_INITDB_ROOT_USERNAME=myroot \
    -e MONGO_INITDB_ROOT_PASSWORD=myroot000 \
    "$IMAGE_NAME"

#
# N.B.
# the arguments MONGO_INITDB_ROOT_USERNAME and MONGO_INITDB_ROOT_PASSWORD above won't work on mongo 3.x version
# so, you need create the root user manually
# after connecting to the mongo container
#
# $ mongo --verbose mongodb://localhost:17017/admin
# > db.createUser({ user: "myroot", pwd: "myroot000", roles: [ "root" ] })
#

#
# verify
#
# mongo --verbose mongodb://myroot:myroot000@localhost:17017/admin
#

# 
# run mongo from docker image
#docker run $_OPTS --name $CONTAINRER_NAME -p "$LOCAL_BIND_PORT":27017 \
#    --mount type=bind,source="$ROOT_DIR/volume/etc-mongo",target=/etc/mongo,readonly \
#    -e MONGO_INITDB_ROOT_USERNAME=myroot \
#    -e MONGO_INITDB_ROOT_PASSWORD=myroot000 \
#    mongo:4.4.3-bionic

# start interactive bash shell
# docker exec -it $CONTAINRER_NAME bash

