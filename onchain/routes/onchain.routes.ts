import { Router, Request, Response } from 'express';
import { onchainRateLimit } from '../middleware/rate-limit';
import { onChainVerification } from '../services/onchain-verification';
import type { OnChainLog } from '../services/onchain-types';
import circuitBreakerRoutes from './circuit-breaker.routes';
import governanceRoutes from './governance.routes';
import multisigRoutes from './multisig.routes';
import auditTrailRoutes from './audit-trail.routes';
import timelockRoutes from './timelock.routes';
import securityScanningRoutes from './security-scanning.routes';
import threatIntelligenceRoutes from './threat-intelligence.routes';

const router = Router();
router.use(onchainRateLimit);

router.get('/onchain/status', (_req: Request, res: Response) => {
  const programId = process.env.SOLANA_PROGRAM_ID || null;
  res.json({
    success: true,
    enabled: true,
    message: 'On-chain verification is active',
    programId,
  });
});

router.post('/onchain/log', async (req: Request, res: Response) => {
  try {
    const logData = req.body as Omit<OnChainLog, 'onChainProof'>;
    const log = await onChainVerification.storeSecurityDecision(logData);
    
    res.json({
      success: true,
      log,
    });
  } catch (error) {
    console.error('Failed to store on-chain log:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to store on-chain log',
    });
  }
});

router.get('/onchain/verify/:proof', async (req: Request, res: Response) => {
  try {
    const proof = req.params.proof as string;
    const result = await onChainVerification.verifyCertificate(proof);
    
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Failed to verify proof:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify proof',
    });
  }
});

router.use(circuitBreakerRoutes);
router.use(governanceRoutes);
router.use(multisigRoutes);
router.use(auditTrailRoutes);
router.use(timelockRoutes);
router.use(securityScanningRoutes);
router.use(threatIntelligenceRoutes);

export default router;
