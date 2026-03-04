#!/bin/bash
set -e

# Vercel build script for the monorepo client
# Finds the monorepo root regardless of working directory

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$SCRIPT_DIR"

echo "==> Build script running from: $(pwd)"
echo "==> Repo root: $REPO_ROOT"

cd "$REPO_ROOT"

echo "==> Building @game/shared..."
pnpm --filter @game/shared build

echo "==> Building @game/client..."
pnpm --filter @game/client build

echo "==> Build complete. Output at packages/client/dist/"
ls -la packages/client/dist/
