#!/usr/bin/env bash
set -e

VECTIX="$(cd "$(dirname "$0")/.." && pwd)"
ELIZA_ROOT="${ELIZA_ROOT:-}"
PLUGIN="${PLUGIN:-plugin-bootstrap}"

if [ -z "$ELIZA_ROOT" ]; then
  echo "Set ELIZA_ROOT to your ElizaOS project root, e.g.:"
  echo "  export ELIZA_ROOT=$HOME/Documents/eliza"
  echo "  export PLUGIN=plugin-bootstrap   # or your plugin name"
  echo "Then run: $0"
  exit 1
fi

if [ ! -d "$ELIZA_ROOT" ]; then
  echo "Eliza root not found: $ELIZA_ROOT"
  exit 1
fi

ACTIONS="$ELIZA_ROOT/packages/$PLUGIN/src/actions"
LIB="$ELIZA_ROOT/packages/$PLUGIN/src/lib"

if [ ! -d "$ACTIONS" ]; then
  echo "Plugin actions folder not found: $ACTIONS"
  echo "Check: ls $ELIZA_ROOT/packages/"
  exit 1
fi

mkdir -p "$LIB"
cp "$VECTIX/colosseum-actions/src/actions/registerForHackathon.ts" "$ACTIONS/"
cp "$VECTIX/colosseum-actions/src/actions/checkHeartbeat.ts" "$ACTIONS/"
cp "$VECTIX/colosseum-actions/src/actions/createForumPost.ts" "$ACTIONS/"
cp "$VECTIX/colosseum-actions/src/actions/createProjectDraft.ts" "$ACTIONS/"
cp "$VECTIX/colosseum-actions/src/lib/secrets.ts" "$LIB/"

echo "Copied 4 actions + secrets.ts into $ELIZA_ROOT/packages/$PLUGIN/src/"
echo "Next: edit packages/$PLUGIN/src/index.ts to import and register the actions (see INTEGRATION.md)."
