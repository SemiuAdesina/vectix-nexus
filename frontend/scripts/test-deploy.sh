#!/bin/bash

set -e

if [ ! -f .env.local ]; then
  echo "Error: .env.local file not found"
  echo "Please copy .env.local.example to .env.local and fill in your FLY_API_TOKEN"
  exit 1
fi

source .env.local

if [ -z "$FLY_API_TOKEN" ]; then
  echo "Error: FLY_API_TOKEN is not set in .env.local"
  echo "Get your token by running: fly tokens create"
  exit 1
fi

echo "Testing /api/deploy-agent endpoint..."
echo ""

curl -X POST http://localhost:3000/api/deploy-agent \
  -H "Content-Type: application/json" \
  -d '{
    "characterJson": {
      "name": "TestAgent",
      "bio": ["Test agent for deployment verification"],
      "adjectives": ["test"],
      "topics": ["testing"]
    }
  }' \
  | jq '.' 2>/dev/null || cat

echo ""
echo "Test complete!"

