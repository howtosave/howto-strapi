#!/bin/bash
#
# generate strapi diff
#

_SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ROOT="$_SCRIPT_DIR/../.." # TODO realpath on mac

pushd "$ROOT"

# check dirty
if [[ ! -z $(git status --porcelain) ]]; then
  echo "!!! working directory is dirty. clean first."
  # exit 1
fi

echo ">>> Copy getstarted from strapi/examples/getstarted"

TARGET_FILES=(
  'api'
  'components'
  'config'
  'extensions'
  'hooks'
  'mkddlewares'
  'plugins'
  'public'
  '.env.example'
)

ROOT_STRAPI="$ROOT/strapi/examples/getstarted"

for file in "${TARGET_FILES[@]}"
do
  if [[ -e "$ROOT_STRAPI/$file" ]]; then
    if [[ -e "$ROOT/$file" ]]; then
      rm -rf "$ROOT/$file"
    fi
    cp -R "$ROOT_STRAPI/$file" "$ROOT/$file"
  fi
done

echo ">>> DONE"
