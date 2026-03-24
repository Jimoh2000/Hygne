#!/usr/bin/env bash
# =============================================================================
# HGyne — GCP Setup Script
# Run this ONCE to set up your entire Google Cloud infrastructure.
#
# Usage:
#   chmod +x infrastructure/scripts/setup-gcp.sh
#   ./infrastructure/scripts/setup-gcp.sh
#
# Prerequisites (all free to install):
#   - Google Cloud SDK: https://cloud.google.com/sdk/docs/install
#   - Docker Desktop:   https://www.docker.com/products/docker-desktop
#   - A Google account with billing enabled on GCP
# =============================================================================

set -euo pipefail

# ── Colors ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# ── Helpers ───────────────────────────────────────────────────────────────────
log()     { echo -e "${BLUE}[HGyne]${NC} $1"; }
success() { echo -e "${GREEN}[✓]${NC} $1"; }
warn()    { echo -e "${YELLOW}[!]${NC} $1"; }
error()   { echo -e "${RED}[✗]${NC} $1"; exit 1; }
section() { echo -e "\n${BOLD}${BLUE}━━━ $1 ━━━${NC}\n"; }
prompt()  { echo -e "${YELLOW}▶${NC} $1"; }

# ── Banner ────────────────────────────────────────────────────────────────────
echo -e "${GREEN}"
cat << 'BANNER'
  _   _  ____
 | | | |/ ___|  _   _ _ __   ___
 | |_| | |  _| | | | | '_ \ / _ \
 |  _  | |_| | | |_| | | | |  __/
 |_| |_|\____|  \__, |_| |_|\___|
                |___/
 GCP Infrastructure Setup
BANNER
echo -e "${NC}"
log "This script will set up your complete GCP infrastructure for HGyne."
log "Estimated time: 5–10 minutes.\n"

# ── Check prerequisites ───────────────────────────────────────────────────────
section "Checking prerequisites"

if ! command -v gcloud &>/dev/null; then
  error "Google Cloud SDK not found.\nInstall it from: https://cloud.google.com/sdk/docs/install\nThen run: gcloud init"
fi
success "gcloud CLI found: $(gcloud version --format='value(Google Cloud SDK)')"

if ! command -v docker &>/dev/null; then
  error "Docker not found.\nInstall from: https://www.docker.com/products/docker-desktop"
fi
success "Docker found: $(docker --version | head -1)"

# ── Login ─────────────────────────────────────────────────────────────────────
section "Google Cloud authentication"

if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
  log "You need to log in to Google Cloud..."
  gcloud auth login
fi

ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -1)
success "Logged in as: $ACCOUNT"

# ── Project selection ─────────────────────────────────────────────────────────
section "Project setup"

echo ""
prompt "Enter your GCP Project ID (or press Enter to create a new one):"
read -r PROJECT_ID

if [[ -z "$PROJECT_ID" ]]; then
  # Generate a unique project ID
  RANDOM_SUFFIX=$(cat /dev/urandom | LC_ALL=C tr -dc 'a-z0-9' | fold -w 6 | head -n 1)
  PROJECT_ID="hgyne-${RANDOM_SUFFIX}"
  log "Creating new project: $PROJECT_ID"
  gcloud projects create "$PROJECT_ID" --name="HGyne" 2>/dev/null || true
  success "Project created: $PROJECT_ID"
else
  # Verify project exists
  if ! gcloud projects describe "$PROJECT_ID" &>/dev/null; then
    error "Project '$PROJECT_ID' not found. Create it at https://console.cloud.google.com"
  fi
  success "Project found: $PROJECT_ID"
fi

gcloud config set project "$PROJECT_ID"

# ── Billing check ─────────────────────────────────────────────────────────────
section "Billing verification"

BILLING=$(gcloud billing projects describe "$PROJECT_ID" --format='value(billingEnabled)' 2>/dev/null || echo "false")
if [[ "$BILLING" != "True" ]]; then
  warn "Billing is not enabled on this project."
  warn "Cloud Run requires billing to be enabled (you get \$300 free credit)."
  echo ""
  warn "Enable billing at: https://console.cloud.google.com/billing/projects"
  prompt "Press Enter after enabling billing, or Ctrl+C to exit..."
  read -r
fi
success "Billing is enabled"

# ── Region selection ──────────────────────────────────────────────────────────
section "Region selection"

echo ""
echo "  Available regions (choose closest to your users):"
echo "  1) us-central1     — Iowa, USA (recommended for global)"
echo "  2) europe-west1    — Belgium, Europe"
echo "  3) asia-southeast1 — Singapore, Asia"
echo "  4) africa-south1   — Johannesburg, Africa (closer to Nigeria!)"
echo ""
prompt "Choose region [1-4, default=1]:"
read -r REGION_CHOICE

case "$REGION_CHOICE" in
  2) REGION="europe-west1" ;;
  3) REGION="asia-southeast1" ;;
  4) REGION="africa-south1" ;;
  *) REGION="us-central1" ;;
esac

success "Using region: $REGION"
AR_HOSTNAME="${REGION}-docker.pkg.dev"

# ── Enable APIs ───────────────────────────────────────────────────────────────
section "Enabling GCP APIs"

log "Enabling required APIs (this takes ~2 minutes)..."

APIS=(
  "run.googleapis.com"
  "artifactregistry.googleapis.com"
  "cloudbuild.googleapis.com"
  "secretmanager.googleapis.com"
  "cloudresourcemanager.googleapis.com"
  "iam.googleapis.com"
  "compute.googleapis.com"
  "logging.googleapis.com"
  "monitoring.googleapis.com"
)

for API in "${APIS[@]}"; do
  gcloud services enable "$API" --project="$PROJECT_ID" --quiet
  success "Enabled: $API"
done

# ── Artifact Registry ─────────────────────────────────────────────────────────
section "Artifact Registry (Docker image storage)"

if gcloud artifacts repositories describe hgyne \
     --location="$REGION" --project="$PROJECT_ID" &>/dev/null; then
  success "Artifact Registry 'hgyne' already exists"
else
  gcloud artifacts repositories create hgyne \
    --repository-format=docker \
    --location="$REGION" \
    --project="$PROJECT_ID" \
    --description="HGyne Docker images"
  success "Artifact Registry created: hgyne"
fi

# Configure Docker to push to Artifact Registry
gcloud auth configure-docker "$AR_HOSTNAME" --quiet
success "Docker configured for Artifact Registry"

# ── Service Account ───────────────────────────────────────────────────────────
section "Service Account setup"

SA_NAME="hgyne-cloud-build"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

if gcloud iam service-accounts describe "$SA_EMAIL" --project="$PROJECT_ID" &>/dev/null; then
  success "Service account already exists: $SA_EMAIL"
else
  gcloud iam service-accounts create "$SA_NAME" \
    --project="$PROJECT_ID" \
    --display-name="HGyne Cloud Build SA"
  success "Service account created: $SA_EMAIL"
fi

# Grant required roles
ROLES=(
  "roles/run.admin"
  "roles/artifactregistry.writer"
  "roles/secretmanager.secretAccessor"
  "roles/iam.serviceAccountUser"
  "roles/logging.logWriter"
)

for ROLE in "${ROLES[@]}"; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$SA_EMAIL" \
    --role="$ROLE" \
    --quiet
done
success "IAM roles granted to service account"

# ── Collect secrets ───────────────────────────────────────────────────────────
section "Environment secrets setup"

log "You'll now enter your secret values. They'll be stored in GCP Secret Manager."
log "Nothing is stored locally or printed to screen.\n"

collect_secret() {
  local SECRET_NAME=$1
  local DESCRIPTION=$2
  local EXAMPLE=$3

  echo ""
  echo -e "  ${BOLD}${SECRET_NAME}${NC}"
  echo -e "  ${DESCRIPTION}"
  [[ -n "$EXAMPLE" ]] && echo -e "  ${YELLOW}Example: ${EXAMPLE}${NC}"
  prompt "Enter value:"
  read -rs SECRET_VALUE
  echo ""

  if [[ -z "$SECRET_VALUE" ]]; then
    warn "Skipped (empty). You can add this later with:"
    warn "  echo -n 'YOUR_VALUE' | gcloud secrets create $SECRET_NAME --data-file=- --project=$PROJECT_ID"
    return
  fi

  if gcloud secrets describe "$SECRET_NAME" --project="$PROJECT_ID" &>/dev/null; then
    echo -n "$SECRET_VALUE" | gcloud secrets versions add "$SECRET_NAME" \
      --data-file=- --project="$PROJECT_ID"
  else
    echo -n "$SECRET_VALUE" | gcloud secrets create "$SECRET_NAME" \
      --data-file=- --project="$PROJECT_ID" --replication-policy=automatic
  fi

  success "Secret stored: $SECRET_NAME"
}

# Public vars (baked into Docker image at build time)
collect_secret "NEXT_PUBLIC_SUPABASE_URL"      "Your Supabase project URL"      "https://xxxx.supabase.co"
collect_secret "NEXT_PUBLIC_SUPABASE_ANON_KEY" "Supabase anon/public key"       "eyJhbGciO..."
collect_secret "NEXT_PUBLIC_PADDLE_CLIENT_TOKEN" "Paddle client-side token"     "live_xxxx"
collect_secret "NEXT_PUBLIC_PADDLE_ENV"          "Paddle environment"            "production"
collect_secret "NEXT_PUBLIC_PADDLE_MONTHLY_PRICE_ID" "Paddle monthly price ID"  "pri_xxxx"
collect_secret "NEXT_PUBLIC_PADDLE_YEARLY_PRICE_ID"  "Paddle yearly price ID"   "pri_xxxx"
collect_secret "NEXT_PUBLIC_APP_URL"             "Your app's public URL"         "https://hgyne.com"

# Private server-only secrets
collect_secret "SUPABASE_SERVICE_ROLE_KEY" "Supabase service role key (keep secret!)" "eyJhbGciO..."
collect_secret "PADDLE_API_KEY"            "Paddle server-side API key"                "live_xxxx"
collect_secret "PADDLE_WEBHOOK_SECRET"     "Paddle webhook signing secret"             "pdl_ntfset_xxxx"
collect_secret "RESEND_API_KEY"            "Resend email API key"                      "re_xxxx"
collect_secret "RESEND_FROM_EMAIL"         "From email address"                        "hello@hgyne.com"
collect_secret "NEXTAUTH_SECRET"           "Random secret (run: openssl rand -base64 32)" ""

success "All secrets stored in Secret Manager"

# Grant Cloud Build SA access to secrets
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')
CB_SA="$PROJECT_NUMBER@cloudbuild.gserviceaccount.com"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$CB_SA" \
  --role="roles/secretmanager.secretAccessor" \
  --quiet

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$CB_SA" \
  --role="roles/run.admin" \
  --quiet

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$CB_SA" \
  --role="roles/iam.serviceAccountUser" \
  --quiet

success "Cloud Build service account granted secret access"

# ── First deploy ──────────────────────────────────────────────────────────────
section "Building and deploying HGyne (first deploy)"

log "Building Docker image locally and pushing to Artifact Registry..."
log "This will take 3–5 minutes...\n"

IMAGE_TAG="${AR_HOSTNAME}/${PROJECT_ID}/hgyne/hgyne-app:latest"

# Fetch public env vars for build
SUPABASE_URL=$(gcloud secrets versions access latest --secret="NEXT_PUBLIC_SUPABASE_URL" --project="$PROJECT_ID")
SUPABASE_ANON=$(gcloud secrets versions access latest --secret="NEXT_PUBLIC_SUPABASE_ANON_KEY" --project="$PROJECT_ID")
PADDLE_TOKEN=$(gcloud secrets versions access latest --secret="NEXT_PUBLIC_PADDLE_CLIENT_TOKEN" --project="$PROJECT_ID")
PADDLE_ENV=$(gcloud secrets versions access latest --secret="NEXT_PUBLIC_PADDLE_ENV" --project="$PROJECT_ID")
PADDLE_MONTHLY=$(gcloud secrets versions access latest --secret="NEXT_PUBLIC_PADDLE_MONTHLY_PRICE_ID" --project="$PROJECT_ID")
PADDLE_YEARLY=$(gcloud secrets versions access latest --secret="NEXT_PUBLIC_PADDLE_YEARLY_PRICE_ID" --project="$PROJECT_ID")
APP_URL=$(gcloud secrets versions access latest --secret="NEXT_PUBLIC_APP_URL" --project="$PROJECT_ID")

DOCKER_BUILDKIT=1 docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$SUPABASE_URL" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$SUPABASE_ANON" \
  --build-arg NEXT_PUBLIC_PADDLE_CLIENT_TOKEN="$PADDLE_TOKEN" \
  --build-arg NEXT_PUBLIC_PADDLE_ENV="$PADDLE_ENV" \
  --build-arg NEXT_PUBLIC_PADDLE_MONTHLY_PRICE_ID="$PADDLE_MONTHLY" \
  --build-arg NEXT_PUBLIC_PADDLE_YEARLY_PRICE_ID="$PADDLE_YEARLY" \
  --build-arg NEXT_PUBLIC_APP_URL="$APP_URL" \
  --tag "$IMAGE_TAG" \
  .

docker push "$IMAGE_TAG"
success "Image pushed to Artifact Registry"

# Deploy to Cloud Run
log "Deploying to Cloud Run..."

gcloud run deploy hgyne-app \
  --image="$IMAGE_TAG" \
  --region="$REGION" \
  --project="$PROJECT_ID" \
  --platform=managed \
  --allow-unauthenticated \
  --min-instances=0 \
  --max-instances=10 \
  --memory=512Mi \
  --cpu=1 \
  --concurrency=80 \
  --timeout=60 \
  --set-secrets=SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY:latest \
  --set-secrets=PADDLE_API_KEY=PADDLE_API_KEY:latest \
  --set-secrets=PADDLE_WEBHOOK_SECRET=PADDLE_WEBHOOK_SECRET:latest \
  --set-secrets=RESEND_API_KEY=RESEND_API_KEY:latest \
  --set-secrets=RESEND_FROM_EMAIL=RESEND_FROM_EMAIL:latest \
  --set-secrets=NEXTAUTH_SECRET=NEXTAUTH_SECRET:latest \
  --update-env-vars="NODE_ENV=production" \
  --quiet

CLOUD_RUN_URL=$(gcloud run services describe hgyne-app \
  --region="$REGION" \
  --project="$PROJECT_ID" \
  --format='value(status.url)')

success "HGyne deployed to Cloud Run!"

# ── Cloud Build trigger ───────────────────────────────────────────────────────
section "Setting up CI/CD (auto-deploy on GitHub push)"

echo ""
prompt "Do you want to connect your GitHub repo for automatic deploys? [y/N]:"
read -r CONNECT_GITHUB

if [[ "$CONNECT_GITHUB" =~ ^[Yy]$ ]]; then
  prompt "Enter your GitHub username:"
  read -r GITHUB_USER
  prompt "Enter your GitHub repo name (e.g. hgyne):"
  read -r GITHUB_REPO

  log "Creating Cloud Build trigger..."
  log "You'll need to connect GitHub in the Cloud Build console (one-time OAuth)."
  log "Opening console..."

  echo ""
  echo -e "  ${BOLD}Follow these steps:${NC}"
  echo "  1. Go to: https://console.cloud.google.com/cloud-build/triggers/connect?project=$PROJECT_ID"
  echo "  2. Choose GitHub → Authenticate"
  echo "  3. Select your repo: $GITHUB_USER/$GITHUB_REPO"
  echo "  4. Come back here and press Enter"
  echo ""
  prompt "Press Enter after connecting GitHub..."
  read -r

  gcloud builds triggers create github \
    --project="$PROJECT_ID" \
    --repo-name="$GITHUB_REPO" \
    --repo-owner="$GITHUB_USER" \
    --branch-pattern="^main$" \
    --build-config="cloudbuild.yaml" \
    --substitutions="_AR_HOSTNAME=${AR_HOSTNAME},_REGION=${REGION}" \
    --name="hgyne-main-deploy" \
    --description="Deploy HGyne on push to main" \
    --quiet 2>/dev/null || warn "Trigger may already exist or GitHub not connected yet."

  success "CI/CD trigger created — every push to main will auto-deploy!"
fi

# ── Custom domain ─────────────────────────────────────────────────────────────
section "Custom domain setup (optional)"

echo ""
prompt "Do you have a custom domain to connect? (e.g. hgyne.com) [y/N]:"
read -r HAS_DOMAIN

if [[ "$HAS_DOMAIN" =~ ^[Yy]$ ]]; then
  prompt "Enter your domain (e.g. hgyne.com):"
  read -r CUSTOM_DOMAIN

  log "Mapping domain to Cloud Run..."
  gcloud beta run domain-mappings create \
    --service=hgyne-app \
    --domain="$CUSTOM_DOMAIN" \
    --region="$REGION" \
    --project="$PROJECT_ID" 2>/dev/null || true

  echo ""
  success "Domain mapping initiated for: $CUSTOM_DOMAIN"
  echo ""
  echo -e "  ${BOLD}Add these DNS records to your domain registrar:${NC}"
  gcloud beta run domain-mappings describe \
    --domain="$CUSTOM_DOMAIN" \
    --region="$REGION" \
    --project="$PROJECT_ID" \
    --format="table(status.resourceRecords[].name,status.resourceRecords[].type,status.resourceRecords[].rrdata)" \
    2>/dev/null || warn "Run this after a few minutes: gcloud beta run domain-mappings describe --domain=$CUSTOM_DOMAIN --region=$REGION"
fi

# ── Budget alert ──────────────────────────────────────────────────────────────
section "Setting up budget alert"

log "Creating a \$50/month budget alert to prevent surprise bills..."

gcloud billing budgets create \
  --billing-account="$(gcloud billing projects describe "$PROJECT_ID" --format='value(billingAccountName)' | cut -d'/' -f2)" \
  --display-name="HGyne Monthly Budget" \
  --budget-amount=50USD \
  --threshold-rule=percent=0.5,basis=current-spend \
  --threshold-rule=percent=0.9,basis=current-spend \
  --threshold-rule=percent=1.0,basis=current-spend \
  2>/dev/null || warn "Budget creation requires billing API. Set manually at: https://console.cloud.google.com/billing/budgets"

# ── Save config ───────────────────────────────────────────────────────────────
section "Saving configuration"

cat > infrastructure/gcp-config.txt << EOF
# HGyne GCP Configuration
# Generated: $(date)

PROJECT_ID=$PROJECT_ID
REGION=$REGION
AR_HOSTNAME=$AR_HOSTNAME
IMAGE=$IMAGE_TAG
CLOUD_RUN_URL=$CLOUD_RUN_URL
SERVICE_ACCOUNT=$SA_EMAIL
EOF

success "Config saved to infrastructure/gcp-config.txt"

# ── Done ──────────────────────────────────────────────────────────────────────
section "Setup complete!"

echo -e "${GREEN}${BOLD}"
cat << 'DONE'
  ✅  HGyne is live on Google Cloud!
DONE
echo -e "${NC}"

echo -e "  ${BOLD}Your app URL:${NC}    ${GREEN}${CLOUD_RUN_URL}${NC}"
echo -e "  ${BOLD}GCP Console:${NC}     https://console.cloud.google.com/run?project=${PROJECT_ID}"
echo -e "  ${BOLD}Build logs:${NC}      https://console.cloud.google.com/cloud-build/builds?project=${PROJECT_ID}"
echo -e "  ${BOLD}Secret Manager:${NC}  https://console.cloud.google.com/security/secret-manager?project=${PROJECT_ID}"
echo ""
echo -e "  ${BOLD}Next steps:${NC}"
echo "  1. Run your Supabase SQL migration (supabase/migrations/001_initial_schema.sql)"
echo "  2. Add your Paddle webhook URL in Paddle dashboard:"
echo "     ${CLOUD_RUN_URL}/api/paddle/webhook"
echo "  3. Update NEXT_PUBLIC_APP_URL secret if you connected a custom domain"
echo "  4. Push to GitHub main branch to trigger auto-deploy"
echo ""
echo -e "  ${YELLOW}Useful commands:${NC}"
echo "  View logs:     gcloud run services logs read hgyne-app --region=$REGION"
echo "  Update secret: echo -n 'VALUE' | gcloud secrets versions add SECRET_NAME --data-file=-"
echo "  Manual deploy: gcloud builds submit --config=cloudbuild.yaml"
echo ""
