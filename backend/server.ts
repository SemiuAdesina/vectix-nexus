import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { validateProductionEnv } from './lib/env-validation';
import healthRoutes from './routes/health.routes';
import stripeRoutes from './routes/stripe.routes';
import deployRoutes from './routes/deploy.routes';
import agentsRoutes from './routes/agents.routes';
import walletRoutes from './routes/wallet.routes';
import webhooksRoutes from './routes/webhooks.routes';
import tokenRoutes from './routes/token.routes';
import marketplaceRoutes from './routes/marketplace.routes';
import advancedFeaturesRoutes from './routes/advanced-features.routes';
import narrativeRoutes from './routes/narrative.routes';
import securityRoutes from './routes/security.routes';
import whitelistRoutes from './routes/whitelist.routes';
import affiliateRoutes from './routes/affiliate.routes';
import protectionRoutes from './routes/protection.routes';
import apiKeysRoutes from './routes/api-keys.routes';
import publicApiRoutes from './routes/public-api.routes';
import publicSecurityRoutes from './routes/public-security.routes';
import onchainRoutes from './routes/onchain.routes';
import bugBountyRoutes from './routes/bug-bounty.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

const allowedOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, origin || allowedOrigins[0]);
    else cb(null, false);
  },
  credentials: true,
}));
app.use(express.json());

validateProductionEnv();

app.use(healthRoutes);
app.use('/api', stripeRoutes);
app.use('/api', deployRoutes);
app.use('/api', agentsRoutes);
app.use('/api', walletRoutes);
app.use('/api', webhooksRoutes);
app.use('/api', tokenRoutes);
app.use('/api', marketplaceRoutes);
app.use('/api', advancedFeaturesRoutes);
app.use('/api', narrativeRoutes);
app.use('/api', securityRoutes);
app.use('/api', whitelistRoutes);
app.use('/api', affiliateRoutes);
app.use('/api', protectionRoutes);
app.use('/api', apiKeysRoutes);
app.use('/api', onchainRoutes);
app.use('/api', publicSecurityRoutes);
app.use('/api', bugBountyRoutes);
app.use('/v1', publicApiRoutes);

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
