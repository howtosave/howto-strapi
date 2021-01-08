#!/bin/bash
# *****************************************************************
# Deployment Script
#
# @ remote server deployment
#   specify a *dev user* with the remote server address
#   - e.g.
#     1. From local to dev server: ./deploy.sh dev00@dev.joyfun.kr (dev-dev)
#     2. From local to prod server: ./deploy.sh jcdev00@joyfun.kr (prod-dev)
#
# @ local deployment
#   specify a *service user* with '127.0.0.1'
#   - e.g.
#     3. From local to local server: ./deploy.sh svc00@127.0.0.1 (local-svc)
#     4. From prod to prod server: ./deploy.sh jcsvc00@127.0.0.1 (local-jc)
#
# *****************************************************************

#
# constants
#
PROJECT_ID=howto-strapi
STAGE_DIR=/var/stage/howto-strapi


_SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ROOT_DIR=${_SCRIPT_DIR}/..

# parse arguments and set BUILD_UI, PUSH_ONLY, DEPLOY_ENV, TARGET_USER, TARGET_SERVER
source "$_SCRIPT_DIR/_deploy_parse_args.sh"
#echo "$BUILD_UI, $PUSH_ONLY, $DEPLOY_ENV, $TARGET_USER, $TARGET_SERVER"

# set STAGE_DIR, SVC_USER
if [[ "$TARGET_SERVER" =~ .*localhost|.*127\.0\.0\.1 ]]; then
  # local deployment
  # deploy to prod directory without push
  STAGE_DIR=${ROOT_DIR}
  SVC_USER=${TARGET_USER}
  IS_LOCAL_DEPLOYMENT=true
else
  # remote deployment
  IS_LOCAL_DEPLOYMENT=false
  SVC_USER=svc00
fi

echo "================================="
echo "#"
echo "# TARGET SERVER: $TARGET_SERVER"
echo "# SVC_USER: $SVC_USER"
echo "# BUILD-UI: $BUILD_UI"
echo "# PUSH_ONLY: $PUSH_ONLY"
echo "# DEPLOY_ENV: $DEPLOY_ENV"
echo "#"
echo "---------------------------------"

while true; do
  read -p "*** Is Good? Continue?[y/n] " yn
  case $yn in
      [Yy]* ) break;;
      [Nn]* ) exit;;
      * ) echo "Please answer y or n.";;
  esac
done

# root dir
pushd ${ROOT_DIR}

# when git is dirty, exit with 1
echo ">>> Check git status"
echo
# is master branch?
if [ "$(git symbolic-ref --short HEAD)" != "master" ]; then
  while true; do
    read -p "*** Current branch is *not* 'master'. Continue?[y/n] " yn
    case $yn in
        [Yy]* ) break;;
        [Nn]* ) exit;;
        * ) echo "Please answer y or n.";;
    esac
  done
fi
# is dirty?
if [ "$(git status -s)" != "" ]; then
  while true; do
    read -p "*** Working directory is DIRTY. Continue?[y/n] " yn
    case $yn in
        [Yy]* ) break;;
        [Nn]* ) exit;;
        * ) echo "Please answer y or n.";;
    esac
  done
fi
# is ahead of 'origin/master'?
if [ "$(git rev-list --count origin/master..master)" != "0" ]; then
  while true; do
    read -p "*** The 'master' branch is ahead of 'origin/master'. Continue?[y/n] " yn
    case $yn in
        [Yy]* ) break;;
        [Nn]* ) exit;;
        * ) echo "Please answer y or n.";;
    esac
  done
fi

if [ "${IS_LOCAL_DEPLOYMENT}" == "true" ]; then
  # pm2 deployment
  if [ ! -d "/srv/prod/${PROJECT_ID}" ]; then
    # deploy-setup
    echo ">>> LOCAL pm2 deploy-setup"
    echo
    SVC_USER=${SVC_USER} pm2 deploy ecosystem.config.js ${DEPLOY_ENV} setup
    if [ "$?" != "0" ]; then
      echo "!!! pm2-deploy-setup failed."
      exit 1
    fi
  fi

  echo ">>> LOCAL pm2 deploy"
  echo
  SVC_USER=${SVC_USER} BUILD_UI=${BUILD_UI} pm2 deploy ecosystem.config.js ${DEPLOY_ENV} --force
  if [ "$?" != "0" ]; then
    echo "!!! pm2-deploy failed."
    exit 1
  fi

  # success
  echo DONE.
  echo

  # pm2 log
  echo "#############################################"
  echo
  #ssh ${SVC_USER}@127.0.0.1 "pm2 show ${PROJECT_NAME}"
  ssh ${SVC_USER}@127.0.0.1 "pm2 logs ${PROJECT_NAME} --lines 25"
else
  echo ">>> REMOTE pm2 deploy"
  echo
  # run script on TARGET_SERVER
  ssh -R ${DEFAULT_PORT_FWD} ${TARGET_SERVER} << EOF
echo @@@ Goto **REMOTE** stage directory...
pushd ${STAGE_DIR}
echo

echo @@@ Check git status
echo

# when git is dirty, exit with 1
if [ "\$(git status -s)" != "" ]; then
  echo !!! Working directory is DIRTY !!!
  echo !!! *CLEANUP* first...
  exit 1
fi

echo @@@ Pull origin
echo
# pull the master branch
git pull origin
if [ "\$?" != "0" ]; then
  echo "!!! git-pull failed."
  exit 1
fi

echo @@@ update submoduel
echo
# pull the master branch
git submodule update strapi
if [ "\$?" != "0" ]; then
  echo "!!! git-submodule update failed."
  exit 1
fi

if [ "${PUSH_ONLY}" != "TRUE" ]; then
  # pm2 deployment
  echo @@@ pm2 deploy
  echo
  # pm2 deploy ecosystem.config.js ${DEPLOY_ENV} setup
  SVC_USER=${SVC_USER} BUILD_UI=${BUILD_UI} pm2 deploy ecosystem.config.js ${DEPLOY_ENV}
  if [ "\$?" != "0" ]; then
    echo "!!! pm2-deploy failed."
    exit 1
  fi

  # pm2 log
  echo "#############################################"
  echo
  ssh ${SVC_USER}@127.0.0.1 "pm2 logs ${PROJECT_NAME} --lines 25"
else
  # success
  echo DONE.
  echo
fi
EOF
fi
