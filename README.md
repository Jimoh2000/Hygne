# HGyne 🌿

> Your personal hygiene advisor — expert tips, curated products, and an anonymous community.

## Tech Stack

| Layer      | Technology                                  |
|------------|---------------------------------------------|
| Frontend   | Next.js 14 (App Router), TypeScript         |
| Styling    | Tailwind CSS, DM Sans + Playfair Display    |
| Database   | Convex (real-time, TypeScript-native)       |
| Auth       | Clerk (Google OAuth, email, MFA)            |
| Payments   | Paddle (global MoR, handles VAT)            |
| Email      | Resend                                      |
| i18n       | next-intl (EN, PT, ES, FR, JA, ZH)         |
| Hosting    | GCP Cloud Run (auto-scales to zero)         |
| CI/CD      | GitHub Actions → Convex Deploy → Cloud Run  |
| Secrets    | GCP Secret Manager                          |

## Why Convex + Clerk?

- **Convex** replaces Supabase: no SQL, no migrations, no RLS policies. Every `useQuery` is real-time by default — community posts update live with zero extra code.
- **Clerk** replaces Supabase Auth: handles email, Google OAuth, password reset, MFA, and user management UI out of the box. Your Convex mutations verify Clerk JWTs automatically.

## Project Structure

```
hgyne/
├── convex/                    # Backend — ALL data logic lives here
│   ├── schema.ts              # Type-safe table definitions + indexes
│   ├── users.ts               # User CRUD, plan upgrades (Clerk sync)
│   ├── tips.ts                # Tip queries (list, search, by slug)
│   ├── products.ts            # Product queries + affiliate tracking
│   ├── community.ts           # Posts, replies, voting (atomic)
│   ├── subscriptions.ts       # Paddle subscription lifecycle
│   ├── seed.ts                # One-click database seeding
│   └── helpers.ts             # Auth utilities (getAuthenticatedUser)
├── src/
│   ├── app/
│   │   ├── (marketing)/       # Landing page, tips, products (public)
│   │   ├── (app)/             # Dashboard, community, settings, profile
│   │   ├── (auth)/            # Clerk sign-in + sign-up pages
│   │   └── api/
│   │       ├── clerk/webhook  # Syncs Clerk users → Convex
│   │       ├── paddle/webhook # Handles subscription events → Convex
│   │       ├── paddle/cancel  # Cancel subscription via Paddle API
│   │       └── email/welcome  # Sends welcome email on signup
│   ├── components/
│   │   ├── ui/                # Button, Card, Badge, Avatar, Input
│   │   ├── layout/            # Navbar (Clerk), Footer, AppSidebar
│   │   └── community/         # NewPostButton, ReplyForm, VoteButton
│   ├── lib/
│   │   ├── convex/provider.tsx  # ConvexProviderWithClerk wrapper
│   │   ├── paddle/client.ts     # Paddle SDK helpers
│   │   └── email/templates.ts   # Resend email templates
│   └── middleware.ts           # Clerk route protection
├── messages/                  # i18n: en, pt, es, fr, ja, zh
├── scripts/
│   ├── setup-gcp.sh           # One-command GCP setup (run this first!)
│   ├── update-secret.sh       # Rotate any secret
│   └── rollback.sh            # Instant rollback
├── .github/workflows/
│   └── deploy.yml             # CI: type-check → convex deploy → docker → cloud run
├── Dockerfile                 # Multi-stage production build
├── cloudbuild.yaml            # GCP Cloud Build alternative pipeline
└── DEPLOYMENT.md              # Full step-by-step deployment guide
```

## Quick Start (Local)

```bash
# 1. Clone and install
git clone https://github.com/YOUR_USERNAME/hgyne.git
cd hgyne
npm install --legacy-peer-deps

# 2. Copy env file
cp .env.example .env.local
# Fill in your Convex URL, Clerk keys, Paddle keys, Resend key

# 3. Start Convex dev server (in one terminal)
npx convex dev

# 4. Start Next.js (in another terminal)
npm run dev:next

# 5. Seed the database (one time)
npm run convex:seed
```

Open http://localhost:3000

## Deploy to Production

```bash
bash scripts/setup-gcp.sh
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the complete guide.

## Data Flow

```
User action (click, post, vote)
      ↓
Convex useMutation() — TypeScript, type-safe
      ↓
Convex function runs server-side — validates, writes
      ↓
All useQuery() subscribers update INSTANTLY (real-time)
      ↓
UI reflects new state — no refresh needed
```

## Auth Flow

```
User signs up/in via Clerk UI
      ↓
Clerk fires user.created webhook
      ↓
/api/clerk/webhook → convex.mutation(api.users.upsertFromClerk)
      ↓
User exists in Convex — plan: 'free'
      ↓
ConvexProviderWithClerk bridges Clerk JWT → Convex auth
      ↓
Every mutation uses getAuthenticatedUser(ctx) — throws if not authed
```

## Scripts

```bash
npm run dev            # Start Convex + Next.js together
npm run build          # Production build
npm run type-check     # TypeScript only (no emit)
npm run convex:deploy  # Deploy Convex functions only
npm run convex:seed    # Seed database with sample data

bash scripts/setup-gcp.sh          # First-time GCP setup
bash scripts/update-secret.sh KEY  # Update a secret
bash scripts/rollback.sh           # Roll back deployment
```
