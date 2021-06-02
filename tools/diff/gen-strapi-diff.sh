#!/bin/bash
#
# generate strapi diff
#

DIFF_VERSION="$1"
if [ "$DIFF_VERSION" == "" ]; then
  echo "!!! no target version specified"
  echo "Usage:"
  echo "  $0 <target_version>"
  echo ""
  echo "Example:"
  echo "  $0 v3.0.0"
  echo ""
  exit 1
fi
#[[ "$DIFF_VERSION" != v* ]] && DIFF_VERSION="v$DIFF_VERSION"
# remove 'v'
[[ "$DIFF_VERSION" == v* ]] && DIFF_VERSION="${DIFF_VERSION:1:${#DIFF_VERSION}}"

_SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ROOT_DIR="$_SCRIPT_DIR/../.." # TODO realpath on mac

pushd "$ROOT_DIR/strapi"

# check the current branch
if [[ $(git branch --show-current) != "my$DIFF_VERSION" ]]; then
  echo "!!! current branch is not my$DIFF_VERSION"
  exit 1
fi

# check dirty
#if [[ ! -z $(git status --porcelain) ]]; then
#  echo "!!! strapi directory is dirty. clean first."
#  exit 1
#fi

# checkout my target version
#if [[ ! -z $(git checkout -q "my$DIFF_VERSION") ]]; then
#  echo "!!! couldn't checkout my$DIFF_VERSION"
#  exit 1
#fi

# fetch strapi target version
if [[ ! -z $(git fetch -q strapi "v$DIFF_VERSION") ]]; then
  echo "!!! couldn't fetch v$DIFF_VERSION from strapi"
  exit 1
fi

echo ">>> Generate diff for $DIFF_VERSION"

# gen diff
mkdir -p "$_SCRIPT_DIR/strapi"
git diff FETCH_HEAD -- ':!*/dist/*' > "$_SCRIPT_DIR/strapi/$DIFF_VERSION.diff"

echo ">>> DONE"
