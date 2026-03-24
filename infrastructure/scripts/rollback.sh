#!/usr/bin/env bash
# =============================================================================
# HGyne — Rollback to previous Cloud Run revision
# Usage: ./infrastructure/scripts/rollback.sh
# =============================================================================

set -euo pipefail

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

CONFIG_FILE="infrastructure/gcp-config.txt"
[[ -f "$CONFIG_FILE" ]] || { echo "Run setup-gcp.sh first"; exit 1; }
source <(grep -v '^#' "$CONFIG_FILE" | sed 's/ *= */=/g')

echo -e "${YELLOW}Fetching recent revisions...${NC}\n"

# List last 5 revisions
gcloud run revisions list \
  --service=hgyne-app \
  --region="$REGION" \
  --project="$PROJECT_ID" \
  --limit=5 \
  --format="table(name,status.conditions[0].status,createTime)"

echo ""
echo -n "Enter revision name to roll back to (e.g. hgyne-app-00005-abc): "
read -r REVISION

gcloud run services update-traffic hgyne-app \
  --region="$REGION" \
  --project="$PROJECT_ID" \
  --to-revisions="$REVISION=100"

echo -e "${GREEN}[✓]${NC} Rolled back to revision: $REVISION"
