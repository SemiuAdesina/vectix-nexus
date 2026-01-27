# VectixLogic - Master Roadmap

> Definition of Done: All boxes checked = sellable business, not a toy.

---

## Phase 1: The Foundation (Infrastructure)

- [x] **1. Repo Setup**
  - Monorepo structure with `frontend/`, `backend/`, `eliza/`, `shared/`
  - Files: `backend/server.ts`, `frontend/app/`, `eliza/` (ElizaOS cloned)

- [x] **2. Auth System**
  - Clerk integration for user login (Social + Email)
  - Files: `frontend/middleware.ts`, `backend/lib/auth.ts`

- [x] **3. Database Schema**
  - SQLite/Prisma with all required tables:
    - `User` (id, email, walletAddress)
    - `Subscription` (status, plan, stripeSubscriptionId)
    - `Agent` (name, characterConfig, machineId, status, encryptedSecrets)
    - `Strategy` (name, description, priceUsd, configJson, category)
    - `StrategyPurchase` (userId, strategyId, pricePaid)
  - File: `backend/prisma/schema.prisma`

---

## Phase 2: The "Money Gate" (Billing)

- [x] **4. Payment Gateway**
  - Stripe integration with Hobby ($29) and Pro ($99) plans
  - Files: `backend/services/stripe.ts`, `backend/routes/stripe.routes.ts`

- [x] **5. Credit Logic**
  - Middleware blocks deployment without active subscription
  - File: `backend/lib/subscription.ts` → `requireActiveSubscription()`

---

## Phase 3: The "Factory" (Agent Creation)

- [x] **6. The "Command Center" UI**
  - Dark-mode dashboard with:
    - Inputs: Name, Ticker, Bio
    - Slider: Risk Level (Low/Med/High)
    - Strategy Store integration
  - Files: `frontend/components/agent-creator/`

- [x] **7. The Config Generator**
  - TypeScript function translates UI → `character.json`
  - File: `frontend/lib/agent-creator/generate-character-config.ts`

- [x] **8. The "Strategy Store" (The Apple Store)** 🆕
  - Marketplace where users browse and purchase premium strategies
  - Database: `Strategy`, `StrategyPurchase` tables
  - Backend: `backend/routes/marketplace.routes.ts`
  - Frontend: `frontend/components/marketplace/strategy-store.tsx`
  - Revenue: Platform takes cut on premium strategy sales
  - Categories: Trading, Meme, DeFi, Social

- [x] **9. The Secret Vault**
  - AES-256-GCM encryption for user API keys
  - File: `backend/services/secrets.ts`

---

## Phase 4: The "Engine" (Deployment)

- [x] **10. Docker Integration**
  - Dockerfile accepts character.json and API keys as env vars
  - Files: `backend/docker/Dockerfile`, `eliza/Dockerfile`

- [x] **11. Cloud Orchestrator**
  - API route `POST /api/deploy-agent` spins up container
  - File: `backend/services/fly.ts` → `createFlyMachine()`

- [x] **12. Lifecycle Controls**
  - Start/Stop/Restart buttons control real servers
  - File: `backend/services/fly-lifecycle.ts`

---

## Phase 5: The "Money Printer" (Wallet & Launch)

- [x] **13. Wallet Generation**
  - Auto-generates Solana Keypair per agent, encrypts private key
  - File: `backend/services/solana.ts` → `WalletManager.generateWallet()`

- [x] **14. Token Launcher (The Viral Tool)**
  - "Launch Token" button deploys on pump.fun
  - Revenue: 1% of token supply to admin treasury
  - Files: `backend/routes/token.routes.ts`, `frontend/components/dashboard/token-launcher.tsx`

- [x] **15. Withdraw Function**
  - "Cash Out" button sends SOL profits to user wallet
  - File: `backend/services/solana-balance.ts` → `withdrawFunds()`

---

## Phase 6: The "Live" Experience (Monitoring)

- [x] **16. Real-Time Logs**
  - Terminal window streams agent thoughts live
  - File: `backend/services/fly-logs.ts`
  - Frontend: `frontend/components/dashboard/agent-logs.tsx`

---

## Revenue Streams

| Stream | Source | Cut |
|--------|--------|-----|
| **SaaS Subscription** | Monthly plans ($29/$99) | 100% |
| **Strategy Sales** | Premium marketplace strategies | Platform fee |
| **Token Launch Tax** | 1% of launched token supply | 1% |

---

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/deploy-agent` | POST | Deploy new agent |
| `/api/agents` | GET | List user's agents |
| `/api/agents/:id/start` | POST | Start agent |
| `/api/agents/:id/stop` | POST | Stop agent |
| `/api/agents/:id/restart` | POST | Restart agent |
| `/api/agents/:id/logs` | GET | Get agent logs |
| `/api/agents/:id/balance` | GET | Get wallet balance |
| `/api/agents/:id/withdraw` | POST | Withdraw funds |
| `/api/agents/:id/launch-token` | POST | Launch token |
| `/api/marketplace/strategies` | GET | List strategies |
| `/api/marketplace/strategies/:id/purchase` | POST | Purchase strategy |
| `/api/marketplace/purchased` | GET | User's purchased strategies |
| `/api/stripe/create-checkout` | POST | Create Stripe checkout |
| `/api/subscription/status` | GET | Check subscription |

---

## Pre-Launch Checklist

- [ ] Replace Stripe placeholder keys with real ones
- [ ] Set `TREASURY_WALLET_ADDRESS` for token royalties
- [ ] Build ElizaOS Docker image: `docker build -t eliza-agent ./eliza`
- [ ] Push image to Fly.io: `fly deploy --image eliza-agent`
- [ ] Create Fly.io app: `fly apps create eliza-agent`
- [ ] Add premium strategies to marketplace
- [ ] Test end-to-end: Sign up → Pay → Deploy → Monitor → Withdraw

---

## Architecture

```
User → Frontend (Next.js) → Backend (Express) → Fly.io (ElizaOS Container)
         ↓                      ↓                      ↓
     Clerk Auth            Prisma/SQLite          Solana Wallet
     Strategy Store        Stripe Billing         pump.fun Token
```

**Status: 16/16 Features Complete ✅**
