#!/usr/bin/env bash
#
# Build the static bundle and sync it to DreamHost.
#
#   ./scripts/deploy.sh                 # dry run — shows what would change
#   ./scripts/deploy.sh --live          # actually uploads
#
# Set DH_USER to your DreamHost shell user before running (or edit the default).

set -euo pipefail

DH_USER="${DH_USER:-}"
DH_HOST="${DH_HOST:-wblatta-tpm-hub.dreamhosters.com}"
DH_PATH="${DH_PATH:-~/wblatta-tpm-hub.dreamhosters.com}"

if [[ -z "$DH_USER" ]]; then
  echo "error: set DH_USER to your DreamHost shell username, e.g." >&2
  echo "  DH_USER=myuser ./scripts/deploy.sh --live" >&2
  exit 1
fi

cd "$(dirname "$0")/.."

echo "==> Building static export"
rm -rf out
npm run build

# .htaccess is injected by the postbuild npm script, which runs as part of
# `npm run build` above — no separate copy step needed here.

# --delete removes files on the server that no longer exist locally, so stale
# hashed assets from previous deploys don't accumulate forever.
RSYNC_ARGS=(-avz --delete --checksum out/ "${DH_USER}@${DH_HOST}:${DH_PATH}/")

if [[ "${1:-}" == "--live" ]]; then
  echo "==> Uploading to ${DH_HOST}"
  rsync "${RSYNC_ARGS[@]}"
  echo "==> Done — https://${DH_HOST}/"
else
  echo "==> DRY RUN (pass --live to upload)"
  rsync --dry-run "${RSYNC_ARGS[@]}"
fi
