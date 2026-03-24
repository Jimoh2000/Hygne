#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# HGyne — Automated GCP Setup (Convex + Clerk stack)
# Usage: bash scripts/setup-gcp.sh
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

log()     { echo -e "${GREEN}✓${NC} $1"; }
info()    { echo -e "${BLUE}ℹ${NC}  $1"; }
warn()    { echo -e "${YELLOW}⚠${NC}  $1"; }
error()   { echo -e "${RED}✗${NC}  $1"; exit 1; }
section() { echo -e "\n${BOLD}${CYAN}── $1 ─${NC}"; }

REGION="us-central1"; SERVICE_NAME="hgyne"; REPO_NAME="hgyne-repo"; SA_NAME="hgyne-deploy"

section "Prerequisites check"
command -v gcloud >/dev/null 2>&1 || error "gcloud not found. Install from https://cloud.google.com/sdk/docs/install"
command -v docker  >/dev/null 2>&1 || error "Docker not found. Install from https://www.docker.com/get-started"
command -v node    >/dev/null 2>&1 || error "Node.js not found."
log "All prerequisites found"

section "Google Cloud login"
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null | grep -q "@"; then
  info "Opening browser for Google login..."
  gcloud auth login
fi
log "Authenticated"

section "Project setup"
echo "Enter your GCP Project ID (or press ENTER to create new):"
echo -n "  Project ID: "; read -r PROJECT_ID
if [[ -z "$PROJECT_ID" ]]; then
  PROJECT_ID="hgyne-$(date +%s | tail -c 6)"
  gcloud projects create "$PROJECT_ID" --name="HGyne"
  log "Project created: $PROJECT_ID"
else
  gcloud projects describe "$PROJECT_ID" >/dev/null 2>&1 || error "Project not found: $PROJECT_ID"
  log "Using: $PROJECT_ID"
fi
gcloud config set project "$PROJECT_ID"

BILLING=$(gcloud billing projects describe "$PROJECT_ID" --format="value(billingEnabled)" 2>/dev/null || echo "false")
if [[ "$BILLING" != "True" ]]; then
  warn "Billing not enabled. Visit: https://console.cloud.google.com/billing/linkedaccount?project=$PROJECT_ID"
  echo "Press ENTER once billing is enabled..."; read -r
fi

section "Enabling GCP APIs"
gcloud services enable \
  run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com \
  secretmanager.googleapis.com iam.googleapis.com iamcredentials.googleapis.com \
  cloudresourcemanager.googleapis.com --quiet
log "APIs enabled"

section "Artifact Registry"
if ! gcloud artifacts repositories describe "$REPO_NAME" --location="$REGION" --quiet 2>/dev/null; then
  gcloud artifacts repositories create "$REPO_NAME" --repository-format=docker --location="$REGION" --description="HGyne Docker images"
  log "Repository created"
else
  log "Repository already exists"
fi
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${SERVICE_NAME}"

section "Service Account & IAM"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
if ! gcloud iam service-accounts describe "$SA_EMAIL" --quiet 2>/dev/null; then
  gcloud iam service-accounts create "$SA_NAME" --display-name="HGyne Deploy"
fi
for ROLE in roles/run.admin roles/artifactregistry.writer roles/secretmanager.secretAccessor roles/iam.serviceAccountTokenCreator; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" --member="serviceAccount:$SA_EMAIL" --role="$ROLE" --quiet >/dev/null 2>&1
done
log "IAM roles granted to $SA_EMAIL"

section "Workload Identity Federation"
echo "Enter your GitHub repo (format: owner/repo-name):"
echo -n "  GitHub repo: "; read -r GITHUB_REPO

WIF_POOL="hgyne-github-pool"; WIF_PROVIDER="hgyne-github-provider"
if ! gcloud iam workload-identity-pools describe "$WIF_POOL" --location=global --quiet 2>/dev/null; then
  gcloud iam workload-identity-pools create "$WIF_POOL" --location=global --display-name="HGyne GitHub Pool"
fi
WIF_POOL_ID=$(gcloud iam workload-identity-pools describe "$WIF_POOL" --location=global --format="value(name)")
if ! gcloud iam workload-identity-pools providers describe "$WIF_PROVIDER" --workload-identity-pool="$WIF_POOL" --location=global --quiet 2>/dev/null; then
  gcloud iam workload-identity-pools providers create-oidc "$WIF_PROVIDER" \
    --workload-identity-pool="$WIF_POOL" --location=global \
    --issuer-uri="https://token.actions.githubusercontent.com" \
    --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
    --attribute-condition="assertion.repository=='${GITHUB_REPO}'"
fi
gcloud iam service-accounts add-iam-policy-binding "$SA_EMAIL" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/${WIF_POOL_ID}/attribute.repository/${GITHUB_REPO}" \
  --quiet >/dev/null 2>&1
WIF_PROVIDER_FULL="${WIF_POOL_ID}/providers/${WIF_PROVIDER}"
log "GitHub Actions → GCP keyless auth configured"

section "Secret Manager — storing secrets"
create_secret() {
  local NAME="$1"; local PROMPT="$2"; local HIDDEN="${3:-false}"
  echo ""; echo -e "  ${BOLD}${NAME}${NC}"; echo "  $PROMPT"
  if [[ "$HIDDEN" == "true" ]]; then echo -n "  Value (hidden): "; read -rs VAL; echo ""
  else echo -n "  Value: "; read -r VAL; fi
  [[ -z "$VAL" ]] && warn "Skipping $NAME" && return
  if gcloud secrets describe "$NAME" --quiet 2>/dev/null; then
    echo -n "$VAL" | gcloud secrets versions add "$NAME" --data-file=-
  else
    echo -n "$VAL" | gcloud secrets create "$NAME" --replication-policy=automatic --data-file=-
  fi
  log "$NAME stored"
}

echo ""; info "Have these ready: Convex deploy key, Clerk keys, Paddle keys, Resend key"; echo ""

# Convex
create_secret "NEXT_PUBLIC_CONVEX_URL"    "Your Convex project URL (https://xxx.convex.cloud)"
create_secret "CONVEX_DEPLOY_KEY"         "Your Convex deploy key (prod:xxx)" "true"

# Clerk
create_secret "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" "Your Clerk publishable key (pk_live_xxx)"
create_secret "CLERK_SECRET_KEY"          "Your Clerk secret key (sk_live_xxx)" "true"
create_secret "CLERK_WEBHOOK_SECRET"      "Your Clerk webhook signing secret (whsec_xxx)" "true"
create_secret "CLERK_JWT_ISSUER_DOMAIN"   "Your Clerk Frontend API URL (https://xxx.clerk.accounts.dev)"

# Paddle
create_secret "NEXT_PUBLIC_PADDLE_CLIENT_TOKEN" "Your Paddle client-side token"
create_secret "NEXT_PUBLIC_PADDLE_MONTHLY_PRICE_ID" "Paddle monthly price ID (pri_xxx)"
create_secret "NEXT_PUBLIC_PADDLE_YEARLY_PRICE_ID"  "Paddle yearly price ID (pri_xxx)"
create_secret "PADDLE_API_KEY"            "Your Paddle API key" "true"
create_secret "PADDLE_WEBHOOK_SECRET"     "Your Paddle webhook secret" "true"

# Resend
create_secret "RESEND_API_KEY"            "Your Resend API key (re_xxx)" "true"

log "All secrets stored in GCP Secret Manager"

section "First deployment"
info "Deploying Convex functions first..."
CONVEX_DEPLOY_KEY=$(gcloud secrets versions access latest --secret=CONVEX_DEPLOY_KEY)
CONVEX_DEPLOY_KEY="$CONVEX_DEPLOY_KEY" npx convex deploy

info "Configuring Docker..."
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

APP_URL="https://${SERVICE_NAME}-${PROJECT_ID}.${REGION}.run.app"
info "Building Docker image (3–5 min)..."
docker build \
  --build-arg NEXT_PUBLIC_CONVEX_URL="$(gcloud secrets versions access latest --secret=NEXT_PUBLIC_CONVEX_URL)" \
  --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="$(gcloud secrets versions access latest --secret=NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)" \
  --build-arg NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in" \
  --build-arg NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up" \
  --build-arg NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard" \
  --build-arg NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard" \
  --build-arg NEXT_PUBLIC_PADDLE_CLIENT_TOKEN="$(gcloud secrets versions access latest --secret=NEXT_PUBLIC_PADDLE_CLIENT_TOKEN)" \
  --build-arg NEXT_PUBLIC_PADDLE_ENV="production" \
  --build-arg NEXT_PUBLIC_PADDLE_MONTHLY_PRICE_ID="$(gcloud secrets versions access latest --secret=NEXT_PUBLIC_PADDLE_MONTHLY_PRICE_ID)" \
  --build-arg NEXT_PUBLIC_PADDLE_YEARLY_PRICE_ID="$(gcloud secrets versions access latest --secret=NEXT_PUBLIC_PADDLE_YEARLY_PRICE_ID)" \
  --build-arg NEXT_PUBLIC_APP_URL="$APP_URL" \
  -t "${IMAGE}:initial" -t "${IMAGE}:latest" .

info "Pushing image..."
docker push "${IMAGE}:initial" && docker push "${IMAGE}:latest"

info "Deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --image="${IMAGE}:initial" \
  --region="$REGION" --platform=managed --allow-unauthenticated \
  --min-instances=0 --max-instances=10 --memory=512Mi --cpu=1 \
  --concurrency=80 --timeout=30s \
  --set-secrets="CLERK_SECRET_KEY=CLERK_SECRET_KEY:latest,CLERK_WEBHOOK_SECRET=CLERK_WEBHOOK_SECRET:latest,CLERK_JWT_ISSUER_DOMAIN=CLERK_JWT_ISSUER_DOMAIN:latest,PADDLE_API_KEY=PADDLE_API_KEY:latest,PADDLE_WEBHOOK_SECRET=PADDLE_WEBHOOK_SECRET:latest,RESEND_API_KEY=RESEND_API_KEY:latest" \
  --set-env-vars="NODE_ENV=production,NEXT_TELEMETRY_DISABLED=1" --quiet

LIVE_URL=$(gcloud run services describe "$SERVICE_NAME" --region="$REGION" --format="value(status.url)")

section "Setup complete! 🎉"
echo ""
echo -e "  ${BOLD}Live URL:${NC}    $LIVE_URL"
echo -e "  ${BOLD}Project:${NC}     $PROJECT_ID"
echo ""
echo -e "${BOLD}Add these to GitHub → Settings → Secrets → Actions:${NC}"
echo ""
echo "  GCP_PROJECT_ID:                 $PROJECT_ID"
echo "  GCP_SERVICE_ACCOUNT:            $SA_EMAIL"
echo "  GCP_WORKLOAD_IDENTITY_PROVIDER: $WIF_PROVIDER_FULL"
echo "  CONVEX_DEPLOY_KEY:              (your Convex deploy key)"
echo "  NEXT_PUBLIC_CONVEX_URL:         (your Convex URL)"
echo "  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: (your Clerk pub key)"
echo "  CLERK_SECRET_KEY:               (your Clerk secret key)"
echo "  CLERK_WEBHOOK_SECRET:           (your Clerk webhook secret)"
echo "  CLERK_JWT_ISSUER_DOMAIN:        (your Clerk frontend API URL)"
echo "  NEXT_PUBLIC_PADDLE_CLIENT_TOKEN:(your Paddle token)"
echo "  NEXT_PUBLIC_PADDLE_MONTHLY_PRICE_ID: (pri_xxx)"
echo "  NEXT_PUBLIC_PADDLE_YEARLY_PRICE_ID:  (pri_xxx)"
echo "  NEXT_PUBLIC_APP_URL:            $LIVE_URL"
echo ""
echo -e "${BOLD}After adding secrets, every git push to main auto-deploys. 🚀${NC}"
echo ""
echo "  Console: https://console.cloud.google.com/run?project=$PROJECT_ID"
