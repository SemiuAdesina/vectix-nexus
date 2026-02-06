# Environment Variables Reference

## Required for Core Functionality

### Authentication (Clerk)
- **Frontend** (`.env.local` or env): `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — from Clerk Dashboard → API Keys → Publishable key.
- **Backend** (`.env`): `CLERK_SECRET_KEY` — from the same Clerk app → API Keys → **Secret key**. Required for verifying JWTs (e.g. API key creation). Restart backend after changing.
```
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### Database
```
DATABASE_URL=file:./dev.db
```

### Stripe Payments
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Solana
```
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
HELIUS_API_KEY=your_helius_key
```

### Encryption
```
ENCRYPTION_KEY=32_byte_hex_key_for_aes_256_gcm
```
Required when deploying agents with API keys (Bring Your Own Keys). Backend uses `SECRETS_ENCRYPTION_KEY` for encrypting stored secrets; if unset, deploy returns 500 when secrets are provided.
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

## Testing

### Deploy without subscription (local only)
Set in backend `.env` to allow deploying agents without an active paid subscription. Do not use in production.
```
ALLOW_DEPLOY_WITHOUT_SUBSCRIPTION=true
```

## Deployment

### Fly.io (Agent Hosting)
```
FLY_API_TOKEN=your_fly_token
FLY_ORG=your_org_name
```

### Simulate deploy without Fly.io (testing only)
Set in backend `.env` to create agents in the DB without calling Fly.io. No `FLY_API_TOKEN` needed. Do not use in production.
```
MOCK_FLY_DEPLOY=true
```

### Frontend URL & CORS
```
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```
Comma-separated for multiple origins (e.g. `https://app.example.com,https://www.example.com`). Backend falls back to `FRONTEND_URL` then `http://localhost:3000` if unset.
```
NEXT_PUBLIC_API_URL=http://localhost:3002
```

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

Before deploying to production (`NODE_ENV=production`), ensure:

1. **Never set in production:** `ALLOW_DEPLOY_WITHOUT_SUBSCRIPTION`, `MOCK_FLY_DEPLOY`, `FORCE_MOCK_DB`
2. **Use live keys:** Stripe `sk_live_*`, Clerk production secret key
3. **Use paid Solana RPC:** Helius, Alchemy, or similar (not public `api.mainnet-beta.solana.com`)
4. **Health checks:** `/health` and `/ready` (DB connectivity) for load balancers

