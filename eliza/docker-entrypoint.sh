#!/bin/sh

set -e
cd /app
export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"

if [ -n "$CHARACTER_CONFIG" ]; then
  echo "$CHARACTER_CONFIG" > /app/custom.character.json
  echo "Character configuration from CHARACTER_CONFIG written to /app/custom.character.json"
  CHARACTER_FILE="/app/custom.character.json"
else
  CHARACTER_FILE="/app/default.character.json"
  echo "No CHARACTER_CONFIG set; using default character at $CHARACTER_FILE"
fi

export SERVER_HOST="${SERVER_HOST:-0.0.0.0}"
export PORT="${PORT:-3000}"

exec bun /app/packages/cli/dist/index.js start --character "$CHARACTER_FILE" --port "$PORT"

