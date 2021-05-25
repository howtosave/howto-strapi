#!/bin/bash
#
# generate strapi diff
#

DIFF_VERSION="3.6.1"

_SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ROOT_DIR="$_SCRIPT_DIR/../.." # TODO realpath on mac

pushd "$ROOT_DIR/strapi"

echo ">>> Generate diff for $DIFF_VERSION"

# check dirty
if [[ ! -z $(git status --porcelain) ]]; then
  echo "!!! strapi directory is dirty. clean first."
  exit 1
fi

# checkout my target version
if [[ ! -z $(git checkout -q "my$DIFF_VERSION") ]]; then
  echo "!!! couldn't checkout my$DIFF_VERSION"
  exit 1
fi

# fetch strapi target version
if [[ ! -z $(git fetch -q strapi "v$DIFF_VERSION") ]]; then
  echo "!!! couldn't fetch v$DIFF_VERSION from strapi"
  exit 1
fi

# gen diff
mkdir -p "$_SCRIPT_DIR/strapi"
git diff FETCH_HEAD -- ':!*/dist/*' > "$_SCRIPT_DIR/strapi/$DIFF_VERSION.diff"

echo ">>> DONE"
