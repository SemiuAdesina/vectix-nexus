#!/bin/bash

set -e

echo "=== CI/CD Status Tracker ==="
echo ""

echo "Recent Failed Runs:"
gh run list --status failure --limit 5 --json databaseId,status,conclusion,workflowName,createdAt,headBranch --jq '.[] | "  ❌ \(.workflowName) | \(.headBranch) | \(.createdAt)"'

echo ""
echo "Recent Runs (Last 5):"
gh run list --limit 5 --json databaseId,status,conclusion,workflowName,createdAt,headBranch --jq '.[] | "  \(if .conclusion == "success" then "✅" elif .conclusion == "failure" then "❌" elif .status == "in_progress" then "🔄" else "⏳" end) \(.workflowName) | \(.headBranch) | \(.status)"'

echo ""
echo "To view details of a failed run:"
echo "  gh run view <run-id> --log-failed"
echo ""
echo "To watch the latest run:"
echo "  gh run watch"
