# Environment Variables Reference

## Required for Core Functionality

### Authentication (Clerk)
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

## Optional - Narrative Tracking (Currently Disabled)

These APIs enable the Narrative Clusters feature for tracking social sentiment:

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

## Deployment

### Fly.io (Agent Hosting)
```
FLY_API_TOKEN=your_fly_token
FLY_ORG=your_org_name
```

### Frontend URL
```
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3002
```

