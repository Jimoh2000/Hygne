#!/usr/bin/env bash
# =============================================================================
# HGyne — View Cloud Run logs
# Usage: ./infrastructure/scripts/logs.sh [--follow]
# =============================================================================

set -euo pipefail

CONFIG_FILE="infrastructure/gcp-config.txt"
[[ -f "$CONFIG_FILE" ]] || { echo "Run setup-gcp.sh first"; exit 1; }
source <(grep -v '^#' "$CONFIG_FILE" | sed 's/ *= */=/g')

FOLLOW="${1:-}"

if [[ "$FOLLOW" == "--follow" || "$FOLLOW" == "-f" ]]; then
  gcloud run services logs tail hgyne-app \
    --region="$REGION" \
    --project="$PROJECT_ID"
else
  gcloud run services logs read hgyne-app \
    --region="$REGION" \
    --project="$PROJECT_ID" \
    --limit=100
fi
