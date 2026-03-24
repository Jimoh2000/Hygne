#!/usr/bin/env bash
# =============================================================================
# HGyne — Update a single secret in GCP Secret Manager
#
# Usage:
#   ./infrastructure/scripts/update-secret.sh SECRET_NAME
#
# Example:
#   ./infrastructure/scripts/update-secret.sh PADDLE_API_KEY
# =============================================================================

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
success() { echo -e "${GREEN}[✓]${NC} $1"; }
error()   { echo -e "${RED}[✗]${NC} $1"; exit 1; }

CONFIG_FILE="infrastructure/gcp-config.txt"
[[ -f "$CONFIG_FILE" ]] || error "Run setup-gcp.sh first"
source <(grep -v '^#' "$CONFIG_FILE" | sed 's/ *= */=/g')

SECRET_NAME="${1:-}"
[[ -z "$SECRET_NAME" ]] && error "Usage: $0 SECRET_NAME"

echo -e "${YELLOW}Updating secret: ${SECRET_NAME}${NC}"
echo -n "Enter new value: "
read -rs SECRET_VALUE
echo ""

if gcloud secrets describe "$SECRET_NAME" --project="$PROJECT_ID" &>/dev/null; then
  echo -n "$SECRET_VALUE" | gcloud secrets versions add "$SECRET_NAME" \
    --data-file=- --project="$PROJECT_ID"
else
  echo -n "$SECRET_VALUE" | gcloud secrets create "$SECRET_NAME" \
    --data-file=- --project="$PROJECT_ID" --replication-policy=automatic
fi

success "Secret updated: $SECRET_NAME"
echo ""
echo "Re-deploy to apply: gcloud builds submit --config=cloudbuild.yaml --project=$PROJECT_ID"
