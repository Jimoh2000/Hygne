# HGyne — Deployment Guide (Convex + Clerk + GCP)

## Stack Overview

```
GitHub (code) → GitHub Actions (CI/CD)
     ↓
Convex Deploy (functions + DB)   ← runs first, always
     ↓
GCP Artifact Registry (Docker image)
     ↓
Cloud Run (Next.js app, auto-scales to zero)
     ↓
Clerk (auth)  +  Convex (DB/realtime)  +  Paddle (payments)
```

## STEP 1 — Create accounts (all free)

| Service | URL | Purpose |
|---------|-----|---------|
| GitHub  | github.com/new | Code + CI/CD |
| Convex  | dashboard.convex.dev | Database + backend |
| Clerk   | dashboard.clerk.com | Authentication |
| Paddle  | vendors.paddle.com/signup | Payments |
| Resend  | resend.com/signup | Email |
| GCP     | console.cloud.google.com | Hosting |

## STEP 2 — Convex setup (~5 min)

```bash
npx convex dev   # opens browser, logs you in, creates project
```

This auto-generates `convex/_generated/` — do NOT edit these files.
Copy your Convex URL from the dashboard.

Then seed the database:
```bash
npm run convex:seed
```

## STEP 3 — Clerk setup (~10 min)

1. Create app at dashboard.clerk.com
2. Enable Google OAuth: User & Authentication → Social Connections → Google
3. Copy: Publishable Key, Secret Key, JWT Issuer Domain
4. Set up webhook:
   - Clerk Dashboard → Webhooks → Add Endpoint
   - URL: `https://yourdomain.com/api/clerk/webhook`
   - Events: `user.created`, `user.updated`, `user.deleted`
   - Copy the Signing Secret

## STEP 4 — Paddle setup (~15 min, after approval)

1. Create product "HGyne Pro" with two prices: $7/month + $59/year
2. Copy both Price IDs (start with `pri_`)
3. Add webhook: `https://yourdomain.com/api/paddle/webhook`
4. Subscribe to: subscription.created, .updated, .canceled, .past_due
5. Copy webhook secret + API key

## STEP 5 — Deploy (~30 min)

Install tools:
```bash
# Mac
brew install google-cloud-sdk
# + download Docker Desktop from docker.com

# Verify
gcloud --version && docker --version
```

Push code to GitHub, then run the one-command setup:
```bash
bash scripts/setup-gcp.sh
```

## STEP 6 — Add GitHub Secrets

After the setup script finishes, add these to GitHub → Settings → Secrets → Actions:

```
GCP_PROJECT_ID
GCP_SERVICE_ACCOUNT
GCP_WORKLOAD_IDENTITY_PROVIDER
CONVEX_DEPLOY_KEY              ← from Convex dashboard → Settings → Deploy Key
NEXT_PUBLIC_CONVEX_URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
CLERK_WEBHOOK_SECRET
CLERK_JWT_ISSUER_DOMAIN
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
NEXT_PUBLIC_PADDLE_MONTHLY_PRICE_ID
NEXT_PUBLIC_PADDLE_YEARLY_PRICE_ID
NEXT_PUBLIC_APP_URL
```

After adding secrets, every `git push main` deploys automatically.
Convex functions deploy FIRST, then Cloud Run — this ordering is critical.

## Daily Operations

```bash
# View logs
gcloud run logs read --service=hgyne --region=us-central1 --limit=50

# Update a secret
bash scripts/update-secret.sh CLERK_SECRET_KEY

# Roll back
bash scripts/rollback.sh

# Deploy Convex functions only (no Docker rebuild)
npm run convex:deploy

# Re-seed database
npm run convex:seed
```

## How Convex + Clerk work together

```
User signs up on Clerk
       ↓
Clerk fires user.created webhook → /api/clerk/webhook
       ↓
Webhook calls convex.mutation(api.users.upsertFromClerk)
       ↓
User appears in Convex users table
       ↓
Every page uses useQuery(api.users.getMe) — reactive, cached, instant
       ↓
Convex JWT from Clerk token authenticates every query/mutation
```

No sessions to manage, no cookies to debug, no RLS policies to write.
Access control lives in your TypeScript mutation handlers.

## Security checklist

- [x] Clerk handles all auth — no passwords stored in your DB
- [x] Convex identity verified on every query/mutation via JWT
- [x] Paddle webhook signature verified (HMAC-SHA256)
- [x] Clerk webhook signature verified (svix)
- [x] Non-root Docker user
- [x] Workload Identity Federation (no GCP service account keys)
- [x] Server-only secrets never in client bundle
- [x] Affiliate URLs validated before redirect
