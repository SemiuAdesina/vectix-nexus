import { Router, Request, Response } from 'express';
import { circuitBreakerService } from '../services/circuit-breaker';

const router = Router();

router.post('/onchain/circuit-breaker/initialize', async (req: Request, res: Response) => {
  try {
    const { agentId, config } = req.body;
    await circuitBreakerService.initializeBreaker(agentId, config);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to initialize circuit breaker:', error);
    res.status(500).json({ success: false, error: 'Failed to initialize circuit breaker' });
  }
});

router.post('/onchain/circuit-breaker/check', async (req: Request, res: Response) => {
  try {
    const { agentId, metrics } = req.body;
    const result = await circuitBreakerService.checkBreaker(agentId, metrics);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Failed to check circuit breaker:', error);
    res.status(500).json({ success: false, error: 'Failed to check circuit breaker' });
  }
});

router.get('/onchain/circuit-breaker/state/:agentId', async (req: Request, res: Response) => {
  try {
    const agentId = req.params.agentId as string;
    const state = await circuitBreakerService.getBreakerState(agentId);
    res.json({ success: true, state });
  } catch (error) {
    console.error('Failed to get circuit breaker state:', error);
    res.status(500).json({ success: false, error: 'Failed to get circuit breaker state' });
  }
});

router.post('/onchain/circuit-breaker/reset', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.body;
    await circuitBreakerService.resetBreaker(agentId);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to reset circuit breaker:', error);
    res.status(500).json({ success: false, error: 'Failed to reset circuit breaker' });
  }
});

export default router;
