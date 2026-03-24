#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════
# HGyne — Update a secret in GCP Secret Manager
# Usage: bash scripts/update-secret.sh SECRET_NAME
# Example: bash scripts/update-secret.sh PADDLE_API_KEY
# ══════════════════════════════════════════════════════════════

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; BLUE='\033[0;34m'; NC='\033[0m'; BOLD='\033[1m'

SECRET_NAME="${1:-}"
[[ -z "$SECRET_NAME" ]] && echo -e "${RED}Usage: bash scripts/update-secret.sh SECRET_NAME${NC}" && exit 1

PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
[[ -z "$PROJECT_ID" ]] && echo -e "${RED}No GCP project set. Run: gcloud config set project YOUR_PROJECT_ID${NC}" && exit 1

echo -e "${BLUE}ℹ${NC}  Updating secret: ${BOLD}$SECRET_NAME${NC} in project ${BOLD}$PROJECT_ID${NC}"
echo -n "  New value (hidden): "
read -rs SECRET_VALUE
echo ""

if [[ -z "$SECRET_VALUE" ]]; then
  echo -e "${RED}✗  Value cannot be empty.${NC}"
  exit 1
fi

echo -n "$SECRET_VALUE" | gcloud secrets versions add "$SECRET_NAME" --data-file=-
echo -e "${GREEN}✓  Secret updated. New version is now active.${NC}"
echo ""
echo "  Force a new deployment to pick up the change:"
echo "  gcloud run services update hgyne --region=us-central1 --redeploy-jobs"
