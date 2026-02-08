# Environment Variables Reference

## VPS / Docker Compose (recommended)

On a VPS (e.g. Hostinger) you run the stack with one `.env` at the **repo root**. Docker Compose passes it to backend, frontend, and agent; the database uses `POSTGRES_*` from the same file.

1. Copy the template: `cp .env.example .env`
2. Set at least: `POSTGRES_PASSWORD`, `NEXT_PUBLIC_API_URL`, `FRONTEND_URL`, `CORS_ORIGIN`, `TRUSTED_ORIGINS`, `SOLANA_RPC_URL`, Clerk and Stripe keys, `SECRETS_ENCRYPTION_KEY`, `WALLET_MASTER_SECRET`. For production, use live keys; leave `ALLOW_DEPLOY_WITHOUT_SUBSCRIPTION` and `ENABLE_NARRATIVE_DEMO` unset; for VPS set `MOCK_FLY_DEPLOY=true` and do not set `FLY_*`.
3. `DATABASE_URL` is **not** in `.env` for Docker: Compose builds it from `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` and injects it into the backend.
4. Rebuild after changing build-time vars (e.g. `NEXT_PUBLIC_*`): `docker compose up -d --build`

See `HOSTINGER_DEPLOY.md` for full deploy steps. The blocks below document each variable in detail.

---

## Required for Core Functionality

### Authentication (Clerk)
- **Frontend** (`.env.local` or env): `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — from Clerk Dashboard → API Keys → Publishable key.
- **Backend** (`.env`): `CLERK_SECRET_KEY` — from the same Clerk app → API Keys → **Secret key**. Required for verifying JWTs (e.g. API key creation). Restart backend after changing.
```
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

The app reads `CLERK_PUBLISHABLE_KEY` at runtime (fallback: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`). Docker Compose sets `CLERK_PUBLISHABLE_KEY` from your root `.env`, so sign-in works after CI builds that inline empty `NEXT_PUBLIC_*` at build time. If sign-in shows "not configured" after a deploy, ensure both keys are in root `.env` and run: `docker compose up -d --force-recreate frontend`.

**401 Unauthorized after login:** Frontend and backend must use the same Clerk environment. If your site is production (e.g. vectixfoundry.com), set **live** keys in root `.env`: `CLERK_SECRET_KEY=sk_live_...` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...`. If the backend still has `sk_test_...`, it will reject every token from the production frontend. To verify: (1) Browser Network tab → pick a failing request → Headers: confirm `Authorization: Bearer ...` is present. (2) Backend: `docker compose logs backend` and look for "Token verification failed" or "Unable to find a signing key"; then switch to live keys and restart backend/frontend.

### Database
- **Local dev:** `DATABASE_URL=file:./dev.db` or `postgresql://user:pass@localhost:5432/vectix_nexus`
- **VPS (Docker):** Do not set `DATABASE_URL` in `.env`. Compose sets it from `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` and the `db` service hostname.

### Stripe Payments
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_HOBBY_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
```

### Solana
```
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
WALLET_MASTER_SECRET=your_32_char_or_hex_secret
```
Use a paid RPC URL (e.g. Helius) in `SOLANA_RPC_URL`. `WALLET_MASTER_SECRET` is used to encrypt/decrypt per-agent wallets (the backend generates a keypair per agent and injects it into the agent; you do not set `SOLANA_PRIVATE_KEY` in the main .env). Optional: `TREASURY_WALLET_ADDRESS` for token launch royalties. `SOLANA_PRIVATE_KEY` in env is only for standalone Eliza single-wallet use (e.g. eliza/.env), not for the Vectix platform deploy.

### Encryption
Backend uses `SECRETS_ENCRYPTION_KEY` for encrypting stored agent secrets and API keys; if unset, deploy returns 500 when secrets are provided. Must be at least 32 characters.
```
SECRETS_ENCRYPTION_KEY=your_32_char_or_longer_secret_key
```

## Optional - Security / Data APIs

**Set only when you have a paid plan.** Leave unset to use free tier (rate-limited). No charges when unset.

### DexScreener (trending tokens)
```
DEXSCREENER_API_KEY=your_key
```

### RugCheck (token security)
```
RUGCHECK_API_KEY=your_key
```

### GoPlus Labs (token security; use access token from their API)
```
GOPLUS_API_KEY=your_access_token
```

## Optional - TEE / Phala (secure enclave)

**Set only when TEE_PROVIDER=phala.** Leave unset when using simulated TEE.
```
TEE_PROVIDER=phala
PHALA_API_KEY=your_phala_key
PHALA_ENDPOINT=https://api.phala.network
```

## Optional - Narrative Tracking (Currently Disabled)

**Set only when subscribed.** These APIs enable Narrative Clusters; no API calls when unset.

### LunarCrush (Recommended)
- Get key: https://lunarcrush.com/developers
- Best for: Crypto-specific social metrics, token mentions
```
LUNARCRUSH_API_KEY=your_lunarcrush_key
```

### Twitter API v2
- Get key: https://developer.twitter.com
- Best for: Direct social scraping, real-time mentions
```
TWITTER_BEARER_TOKEN=your_twitter_bearer_token
```

### Santiment
- Get key: https://app.santiment.net/account
- Best for: On-chain social data, whale tracking
```
SANTIMENT_API_KEY=your_santiment_key
```

## Optional - ElizaOS Agent Features

### OpenAI (Agent Intelligence)
```
OPENAI_API_KEY=sk-...
```

### Twitter (Agent Posting)
```
TWITTER_API_KEY=your_key
TWITTER_API_SECRET_KEY=your_secret
TWITTER_ACCESS_TOKEN=your_token
TWITTER_ACCESS_TOKEN_SECRET=your_token_secret
```

## Optional - Opik (Comet ML) observability

**Backend:** Reads from root `.env` (or `backend/.env` locally). When set, every `POST /deploy-agent` is traced to Comet (project/workspace below).

**Agent (Eliza):** The `agent` service in Docker Compose receives these from the same root `.env`. When set, every `generateText()` in the Eliza runtime is traced so you see agent "thinking" and token usage in the Opik dashboard.

Set in root `.env` for VPS (Docker passes them to backend and agent):

```
OPIK_API_KEY=your_comet_opik_api_key
OPIK_PROJECT_NAME=vectix-foundry
OPIK_WORKSPACE_NAME=semiuadesina
```

If unset, Opik is disabled (no errors). See [README § Opik Observability Workflow](README.md#opik-observability-workflow).

## Testing / Demo Mode

### Deploy without subscription (local or demo)
Set in backend `.env` to allow deploying agents without an active paid subscription. In production, also set `ALLOW_TEST_KEYS_IN_PRODUCTION=true` to enable.
```
ALLOW_DEPLOY_WITHOUT_SUBSCRIPTION=true
```

### Subscription bypass (demo mode)
Set in frontend (build-time) to skip Stripe checkout on pricing page; Get Started redirects to /create instead.
```
NEXT_PUBLIC_ALLOW_SUBSCRIPTION_BYPASS=true
```
Use with `ALLOW_DEPLOY_WITHOUT_SUBSCRIPTION=true` and `ALLOW_TEST_KEYS_IN_PRODUCTION=true` for demo.

## Deployment

### VPS (Docker Compose)
Use a single `.env` at repo root (see top of this file). Set:
- `NEXT_PUBLIC_API_URL`, `FRONTEND_URL`, `CORS_ORIGIN`, `TRUSTED_ORIGINS` to your public URL. For vectixfoundry.com (single domain, API at /api): `NEXT_PUBLIC_API_URL=https://vectixfoundry.com`, `FRONTEND_URL=https://vectixfoundry.com`, `CORS_ORIGIN=https://vectixfoundry.com,https://www.vectixfoundry.com`. Comma-separated for multiple origins.

### VPS (no Fly.io)
When the full stack runs on a VPS with Docker Compose, the agent runs in the `agent` container. You do **not** need Fly.io or any `FLY_*` variables. Set:
```
MOCK_FLY_DEPLOY=true
```
so the backend deploy flow does not call the Fly API. Leave `FLY_API_TOKEN` and other `FLY_*` vars unset.

**Fleet "Latest Activity":** With `MOCK_FLY_DEPLOY=true`, the Fleet card shows a system message instead of empty "Awaiting next action...". To show live activity, use either method (see API docs → Report agent activity):

1. **User-authenticated:** `POST /api/agents/:id/activity` with `Authorization: Bearer <user_token>` and body `{ "message": "Your activity text" }`.
2. **Service-to-service (Docker agent):** Set `AGENT_ACTIVITY_SECRET` in root `.env` and pass it to the agent container. Call `POST /api/agent-activity` with header `X-Agent-Activity-Secret: <AGENT_ACTIVITY_SECRET>` and body `{ "agentId": "<agent_id>", "message": "Your activity text" }`. The agent container needs `BACKEND_URL` (or your API base URL) and the secret; use the agent’s DB id for `agentId`.

**Optional – Agent activity reporting (VPS/Docker):** To let the Docker agent report activity to Fleet "Latest Activity", set in root `.env`:
```
AGENT_ACTIVITY_SECRET=your_strong_secret_here
```
Pass it to the agent container (e.g. in docker-compose `environment: AGENT_ACTIVITY_SECRET: ${AGENT_ACTIVITY_SECRET:-}`). The agent (or a sidecar) then calls `POST /api/agent-activity` with header `X-Agent-Activity-Secret` and body `{ agentId, message }`. If unset, that endpoint returns 501.

### Fly.io (optional; only if you run agents on Fly again)
If you later host agents on Fly.io instead of the VPS Docker agent:
```
FLY_API_TOKEN=your_fly_token
FLY_API_HOSTNAME=https://api.machines.dev
FLY_APP_NAME=eliza-agent
FLY_IMAGE=registry.fly.io/eliza-agent:latest
```
Then set `MOCK_FLY_DEPLOY=false` (and use production env validation).

### Trade Limits (Production)
Max live trade amount per transaction (SOL). Default: 50.
```
MAX_TRADE_AMOUNT_SOL=50
```

### Withdrawal Limits
Max withdrawal per transaction (SOL). Default: 50. Set REDIS_URL for circuit breaker and rate limit persistence.
```
MAX_WITHDRAWAL_PER_TX_SOL=50
MAX_WITHDRAWAL_PER_DAY_SOL=100
REDIS_URL=redis://localhost:6379
```

### Supervisor Rules
Delay before rule changes apply to live agents (ms). Default: 1 hour.
```
RULE_CHANGE_DELAY_MS=3600000
```

### Token Launch (Production)
Treasury wallet for token royalties (1% of launched supply).
```
TREASURY_WALLET_ADDRESS=your_solana_wallet_address
```

## Production Checklist

Before deploying to production (VPS or otherwise, `NODE_ENV=production`):

1. **Never set in production:** `ALLOW_DEPLOY_WITHOUT_SUBSCRIPTION`, `FORCE_MOCK_DB`, `ENABLE_NARRATIVE_DEMO`. For VPS, set `MOCK_FLY_DEPLOY=true` and do not set `FLY_API_TOKEN`.
2. **Use live keys:** Stripe `sk_live_*`, Clerk production secret key; set `STRIPE_WEBHOOK_SECRET` to the live webhook secret
3. **Use paid Solana RPC:** Helius, Alchemy, or similar (not public `api.mainnet-beta.solana.com`)
4. **Set URLs:** `NEXT_PUBLIC_API_URL`, `FRONTEND_URL`, `CORS_ORIGIN`, `TRUSTED_ORIGINS` to your production domain(s)
5. **Secrets:** `SECRETS_ENCRYPTION_KEY` (32+ chars), `WALLET_MASTER_SECRET`; optionally `TREASURY_WALLET_ADDRESS` for token launch
6. **Health checks:** `/health` and `/ready` (DB connectivity) for load balancers or monitoring

