#!/bin/sh

set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
cd "$SCRIPT_DIR/.."

VERSION="$(jq -r ".version" <package.json)"
DIST_NAME="um-web.$1.v${VERSION}"

case "$1" in
"web") npm run build ;;
"extension")
  npm run build
  npm run make-extension
  ;;
"--all")
  "$0" web
  "$0" extension
  exit 0
  ;;

*)
  echo "Unknown command: $1"
  exit 1
  ;;
esac

cp README.md LICENSE dist/
mv dist "${DIST_NAME}"
zip -r9 "${DIST_NAME}.zip" "${DIST_NAME}"
rm -rf "${DIST_NAME}"
