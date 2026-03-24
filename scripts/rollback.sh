#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════
# HGyne — Rollback to a previous Cloud Run revision
# Usage: bash scripts/rollback.sh
# ══════════════════════════════════════════════════════════════

set -euo pipefail

GREEN='\033[0;32m'; BLUE='\033[0;34m'; YELLOW='\033[1;33m'; BOLD='\033[1m'; NC='\033[0m'

REGION="us-central1"
SERVICE="hgyne"
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)

echo -e "${BLUE}ℹ${NC}  Fetching recent revisions for ${BOLD}$SERVICE${NC}..."
echo ""

# List last 5 revisions with traffic
gcloud run revisions list \
  --service="$SERVICE" \
  --region="$REGION" \
  --format="table(name,status.conditions[0].lastTransitionTime:label=DEPLOYED,spec.containers[0].image:label=IMAGE)" \
  --limit=5

echo ""
echo "Enter the revision name to roll back to (copy from table above):"
echo -n "  Revision: "
read -r REVISION

[[ -z "$REVISION" ]] && echo "Cancelled." && exit 0

echo ""
echo -e "${YELLOW}⚠${NC}  Rolling back to: $REVISION"
echo -n "  Confirm? (y/N): "
read -r CONFIRM

[[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]] && echo "Cancelled." && exit 0

gcloud run services update-traffic "$SERVICE" \
  --region="$REGION" \
  --to-revisions="${REVISION}=100"

echo ""
echo -e "${GREEN}✓  Rolled back successfully. 100% traffic → $REVISION${NC}"
echo "   GCP Console: https://console.cloud.google.com/run/detail/$REGION/$SERVICE/revisions?project=$PROJECT_ID"
