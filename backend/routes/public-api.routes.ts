import { Router } from 'express';
import { apiKeyAuth } from '../middleware/api-auth.middleware';
import agentsRoutes from './public-api/agents.routes';
import tradeRoutes from './public-api/trade.routes';
import marketRoutes from './public-api/market.routes';

const router = Router();
router.use(apiKeyAuth);
router.use(agentsRoutes);
router.use(tradeRoutes);
router.use(marketRoutes);

export default router;

