#!/bin/sh

set -e

if [ -z "$CHARACTER_CONFIG" ]; then
  echo "Error: CHARACTER_CONFIG environment variable is required"
  exit 1
fi

echo "$CHARACTER_CONFIG" > /app/custom.character.json

echo "Character configuration written to /app/custom.character.json"

exec node packages/cli/dist/index.js start --character /app/custom.character.json

