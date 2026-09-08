#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$ROOT/site/data"
rsync -a --delete "$ROOT/data/" "$ROOT/site/data/"
echo "Synced data/ → site/data/"
