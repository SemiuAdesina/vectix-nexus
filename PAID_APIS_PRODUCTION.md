# Paid APIs & Production Readiness

## Hardcoded Secrets Audit

**Result: No production secrets are hardcoded.**

- No `sk_live_`, `sk_test_`, `pk_live_`, `pk_test_`, or `whsec_` keys in source code
- All API keys, tokens, and secrets are loaded from `process.env`
- Test files, `.env.example`, README, and docs use placeholders only (acceptable)

**Values with fallbacks (override in production):**

| Variable | Fallback | Production action |
|----------|----------|-------------------|
| `SOLANA_RPC_URL` | `https://api.mainnet-beta.solana.com` | **Must set** paid RPC. Env validation blocks this fallback when `NODE_ENV=production` |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3002` | **Must set** to production backend URL (e.g. `https://api.vectix.com`) |
| `API_KEY_HASH_SALT` | `vectix-nexus-api-key-v1` | **Recommend** setting a unique 32+ char value for production |
| Docker build args | `pk_test_placeholder`, `localhost:3002` | **Must override** when building production images |

---

## Paid APIs – Production Checklist

### 1. Solana RPC (required for trading)

| Item | Action |
|------|--------|
| Provider | Helius, Alchemy, QuickNode, or similar |
| Env var | `SOLANA_RPC_URL` |
| Format | Helius: `https://mainnet.helius-rpc.com/?api-key=YOUR_KEY` |
| Validation | Env validation fails if public RPC or empty |
| To do | Sign up, create project, copy RPC URL with API key |

---

### 2. Stripe (required for payments)

| Item | Action |
|------|--------|
| Keys | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| Production | Use `sk_live_*`, `whsec_*`, `pk_live_*` |
| Validation | Env validation fails if `sk_test_` in production |
| To do | Enable live mode, create live keys, configure webhook URL, update webhook secret |

---

### 3. Clerk (required for auth)

| Item | Action |
|------|--------|
| Keys | `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` |
| Production | Use production secret key (not `sk_test_`) |
| Validation | Env validation fails if `sk_test_` in production |
| To do | Switch to production instance, add production domain, copy production keys |

---

### 4. Agent hosting (VPS or Fly.io)

| Item | Action |
|------|--------|
| **VPS (recommended)** | Agent runs in Docker (`agent` service). Do not set `FLY_*`. Set `MOCK_FLY_DEPLOY=true`. No Fly.io account needed. |
| **Fly.io (optional)** | Set `FLY_API_TOKEN`, `FLY_APP_NAME`, etc. Set `MOCK_FLY_DEPLOY=false`. Validation fails if both `MOCK_FLY_DEPLOY=true` and `FLY_API_TOKEN` are set in production. |

---

### 5. DexScreener (trending tokens)

| Item | Action |
|------|--------|
| Env var | `DEXSCREENER_API_KEY` (optional) |
| Support | When set, sent as `X-API-KEY` header |
| Default | Public API ~60 req/min without key |
| To do | Get key from DexScreener if rate-limited; set env var |

---

### 6. RugCheck (token security)

| Item | Action |
|------|--------|
| Env var | `RUGCHECK_API_KEY` (optional) |
| Support | When set, sent as `X-API-KEY` header |
| To do | Get key from rugcheck.xyz; set env var for higher limits |

---

### 7. GoPlus Labs (token security)

| Item | Action |
|------|--------|
| Env var | `GOPLUS_API_KEY` (optional; use access token from docs.gopluslabs.io) |
| Support | When set, sent as `Authorization: Bearer <key>` |
| To do | Get token from api.gopluslabs.io if needed; set env var |

---

### 8. Narrative APIs (optional)

| API | Env var | Status |
|-----|---------|--------|
| LunarCrush | `LUNARCRUSH_API_KEY` | Optional – lunarcrush.com/developers |
| Twitter | `TWITTER_BEARER_TOKEN` | Optional – developer.twitter.com |
| Santiment | `SANTIMENT_API_KEY` | Optional – app.santiment.net |

---

### 9. TEE / Phala (optional – secure enclave)

| Item | Action |
|------|--------|
| Env vars | `PHALA_API_KEY`, `PHALA_ENDPOINT`, `TEE_PROVIDER` |
| Default | `TEE_PROVIDER=simulated` |
| To do | If using Phala: sign up, get key, set `TEE_PROVIDER=phala` |

---

### 10. Agent secrets (OpenAI, Anthropic, etc.)

| Item | Action |
|------|--------|
| Storage | User-provided; encrypted with `SECRETS_ENCRYPTION_KEY` |
| Env var | `SECRETS_ENCRYPTION_KEY` (32+ chars) |
| Validation | Env validation requires 32+ chars in production |
| To do | Set strong, unique key; never share |

---

## Pre-Launch Summary

**Required before live trading:**

1. Set `SOLANA_RPC_URL` to a paid RPC (Helius, Alchemy, etc.)
2. Use live Stripe keys and configure webhook
3. Use production Clerk keys
4. **VPS:** set `MOCK_FLY_DEPLOY=true`, do not set `FLY_*`. **Fly.io:** set `FLY_API_TOKEN`, set `MOCK_FLY_DEPLOY=false`
5. Set `SECRETS_ENCRYPTION_KEY` (32+ chars)
6. Set `NEXT_PUBLIC_API_URL` to production backend URL
7. Set `TREASURY_WALLET_ADDRESS` if using token launch
8. Run `npx prisma migrate deploy`
9. Set `REDIS_URL` for circuit breaker and rate limit persistence
10. Override Docker build args when building production images

**Recommended (optional APIs – set env vars if you use them or hit rate limits):**

| Service | Env var(s) | Notes |
|---------|------------|--------|
| DexScreener | `DEXSCREENER_API_KEY` | Optional; `X-API-KEY` header when set |
| RugCheck | `RUGCHECK_API_KEY` | Optional; `X-API-KEY` header when set |
| GoPlus | `GOPLUS_API_KEY` | Optional; access token as `Authorization: Bearer` |
| Narrative – LunarCrush | `LUNARCRUSH_API_KEY` | Optional – lunarcrush.com/developers |
| Narrative – Twitter | `TWITTER_BEARER_TOKEN` | Optional – developer.twitter.com |
| Narrative – Santiment | `SANTIMENT_API_KEY` | Optional – app.santiment.net |
| Phala / TEE | `PHALA_API_KEY`, `PHALA_ENDPOINT`, `TEE_PROVIDER=phala` | Optional – secure enclave |

- Set `API_KEY_HASH_SALT` to a unique 32+ char value for production
