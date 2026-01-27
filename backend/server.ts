import 'dotenv/config';
import express from 'express';
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
import bugBountyRoutes from './routes/bug-bounty.routes';
import onchainRoutes from '../onchain/routes/onchain.routes';
import {
  securityHeaders,
  secureCors,
  requestIdMiddleware,
  globalRateLimiter,
} from './middleware/security.middleware';
import { errorHandler, notFoundHandler } from './lib/error-handler';
import { requestLogger, errorLogger } from './middleware/request-logger.middleware';
import { logger } from './lib/logger';

const app = express();
const PORT = process.env.PORT || 3002;

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(requestIdMiddleware);
app.use(securityHeaders());
app.use(globalRateLimiter);
app.use(secureCors({
  trustedOrigins: process.env.TRUSTED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3002',
  ],
}));

app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(requestLogger);

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

import { securityScanningService } from '../onchain/services/security-scanning';
securityScanningService.startContinuousScanning();

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
  });
});

app.use(notFoundHandler);
app.use(errorLogger);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`, { context: 'SERVER' });
});
