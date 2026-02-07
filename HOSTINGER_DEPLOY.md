# Hostinger VPS deployment (Docker Compose)

Run the full stack (PostgreSQL, Express backend, Next.js frontend, ElizaOS agent) on a single VPS using Docker Compose.

## Frontend → Backend → Postgres (confirmed)

- **Frontend** talks only to the **backend** (one base URL). All API calls use `NEXT_PUBLIC_API_URL` (or `NEXT_PUBLIC_BACKEND_URL`): agents, wallet, subscription, marketplace, security, protection, advanced-features, **onchain** (audit, governance, threats, circuit-breaker, multisig, timelock, etc.) are all on the same Express server at `/api/*` and `/v1/*`.
- **Backend** connects to **PostgreSQL** via `DATABASE_URL` (set by Compose from `POSTGRES_*`). The frontend never talks to Postgres.
- **Onchain** is not a separate service: it is mounted on the same backend at `/api/onchain/*`. Set `NEXT_PUBLIC_API_URL` to your API URL (e.g. `https://api.vectixfoundry.com`) and the frontend will reach backend and onchain correctly.

## VPS plan (Hostinger KVM)

| Plan   | RAM  | vCPU | Use case |
|--------|------|------|----------|
| KVM 1  | 4 GB | 1    | Minimum; may swap under load (DB + backend + frontend + agent). |
| **KVM 2** | **8 GB** | **2** | **Recommended.** Comfortable for all four services and agent activity. |
| KVM 4  | 16 GB| 4    | Heavier traffic, multiple users, or growth. |
| KVM 8  | 32 GB| 8    | Scale or many concurrent agents. |

Rough usage: PostgreSQL ~1 GB, backend ~0.5–1 GB, Next.js ~0.3–0.5 GB, ElizaOS agent ~0.5–1.5 GB. **Choose KVM 2** for a stable single-stack deployment.

## 1. VPS

- SSH: `ssh root@YOUR_VPS_IP`
- Install Docker and Docker Compose:
  - `apt update && apt install -y docker.io docker-compose-plugin`
  - Or: [Install Docker Engine](https://docs.docker.com/engine/install/) and [Compose V2](https://docs.docker.com/compose/install/linux/)

## 2. Clone and env

```bash
git clone YOUR_REPO_URL vectix-nexus && cd vectix-nexus
cp .env.example .env
```

Edit `.env` in the repo root (this single file is used by all four services):

- **Required:** `POSTGRES_PASSWORD`, `SOLANA_RPC_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SECRETS_ENCRYPTION_KEY`, `WALLET_MASTER_SECRET` (and Stripe price IDs if using billing). Agent wallets are per-agent (backend generates and encrypts with `WALLET_MASTER_SECRET`); do not set `SOLANA_PRIVATE_KEY` in root .env.
- **URLs (domain: vectixfoundry.com):** set `NEXT_PUBLIC_API_URL=https://api.vectixfoundry.com`, `FRONTEND_URL=https://vectixfoundry.com`, `CORS_ORIGIN=https://vectixfoundry.com,https://www.vectixfoundry.com`, `TRUSTED_ORIGINS=https://vectixfoundry.com,https://www.vectixfoundry.com`. Use a reverse proxy (Nginx) + Let’s Encrypt so the backend is on port 443 at api.vectixfoundry.com and the frontend at vectixfoundry.com.
- **Production:** use live Clerk/Stripe keys; leave `ALLOW_DEPLOY_WITHOUT_SUBSCRIPTION`, `ENABLE_NARRATIVE_DEMO` unset or false. For VPS, set `MOCK_FLY_DEPLOY=true` (agent runs in Docker; Fly.io is not used). Do not set any `FLY_*` variables.

Full variable list and optional keys: see `.env.example` and `ENV_REFERENCE.md`.

## 3. Launch

```bash
docker compose up -d --build
```

On first deploy, run migrations:

```bash
docker compose exec backend npx prisma migrate deploy
```

## 4. Access

**With domain vectixfoundry.com (after Nginx + SSL):**
- Frontend: `https://vectixfoundry.com`
- Backend API: `https://api.vectixfoundry.com`
- Agent: internal or `https://agent.vectixfoundry.com` if you expose it

**Before DNS/SSL (direct to VPS):** `http://YOUR_VPS_IP:3000`, `http://YOUR_VPS_IP:3002`, `http://YOUR_VPS_IP:3001`. Point DNS for vectixfoundry.com and api.vectixfoundry.com to your VPS IP, then add Nginx + Let’s Encrypt for HTTPS.

## 5. Optional env (see ENV_REFERENCE.md)

- `CHARACTER_CONFIG`: JSON string for ElizaOS character (default: `eliza/default.character.json`)
- `DEXSCREENER_API_KEY`, `RUGCHECK_API_KEY`, `GOPLUS_API_KEY` for paid APIs
- `REDIS_URL` for rate limits / circuit breaker
- `MAX_TRADE_AMOUNT_SOL`, `MAX_WITHDRAWAL_*` for limits
