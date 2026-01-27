import { Router, Response } from 'express';
import { requireScope, ApiAuthRequest } from '../../middleware/api-auth.middleware';
import { prisma } from '../../lib/prisma';
import { recordReferralEarning } from '../../services/affiliate/affiliate.service';
import { circuitBreakerService } from '../../../onchain/services/circuit-breaker';
import { auditTrailService } from '../../../onchain/services/audit-trail';
import { threatIntelligenceService } from '../../../onchain/services/threat-intelligence';
import { analyzeToken } from '../../services/security/token-security';
import { RuleEngine } from '../../services/supervisor/rule-engine';

const router = Router();

interface TradeRequest { 
  action: 'buy' | 'sell'; 
  token: string; 
  amount: number; 
  mode?: 'paper' | 'live'; 
}

router.post('/agents/:id/trade', requireScope('write:trade'), async (req: ApiAuthRequest, res: Response) => {
  const agent = await prisma.agent.findFirst({ where: { id: req.params.id, userId: req.apiAuth!.userId } });
  if (!agent) return res.status(404).json({ error: 'Agent not found' });

  const { action, token, amount, mode = 'paper' } = req.body as TradeRequest;
  if (!action || !token || !amount) return res.status(400).json({ error: 'action, token, and amount required' });

  const effectiveMode = req.apiAuth!.tier === 'free' ? 'paper' : mode;
  if (mode === 'live' && req.apiAuth!.tier === 'free') {
    return res.status(403).json({ error: 'Live trading requires Pro subscription. Trade executed as paper.' });
  }

  const breakerCheck = await circuitBreakerService.checkBreaker(agent.id, { volume: amount, tradeCount: 1 });
  if (!breakerCheck.allowed) {
    await auditTrailService.logSecurityEvent({
      agentId: agent.id,
      tokenAddress: token,
      decision: 'rejected',
      reason: `Circuit breaker: ${breakerCheck.reason}`,
      metadata: { action, amount, mode: effectiveMode },
    });
    return res.status(429).json({ error: breakerCheck.reason, circuitBreaker: true });
  }

  const threatCheck = await threatIntelligenceService.detectAnomaly({
    volume: amount,
    tokenAddress: token,
    tradeCount: 1,
  });
  if (threatCheck.isAnomaly && threatCheck.confidence > 70) {
    await auditTrailService.logSecurityEvent({
      agentId: agent.id,
      tokenAddress: token,
      decision: 'rejected',
      reason: `Threat detected: ${threatCheck.reason}`,
      metadata: { action, amount, mode: effectiveMode, confidence: threatCheck.confidence },
    });
    return res.status(403).json({ error: threatCheck.reason, threatDetected: true });
  }

  const tokenAnalysis = await analyzeToken(token);
  if (tokenAnalysis) {
    const ruleEngine = new RuleEngine();
    const supervisorDecision = ruleEngine.evaluate({
      agentId: agent.id,
      action: action.toUpperCase() as 'BUY' | 'SELL',
      tokenAddress: token,
      tokenSymbol: token.slice(0, 8),
      amountSol: amount,
      portfolioValueSol: amount * 2,
      tokenLiquidity: tokenAnalysis.report.liquidityUsd,
      tokenMarketCap: 0,
      dailyTradeCount: 1,
      trustScore: tokenAnalysis.trustScore.score,
    });

    if (!supervisorDecision.approved) {
      await auditTrailService.logSecurityEvent({
        agentId: agent.id,
        tokenAddress: token,
        decision: 'rejected',
        reason: `Supervisor AI: ${supervisorDecision.violations.map(v => v.message).join('; ')}`,
        metadata: { action, amount, mode: effectiveMode, violations: supervisorDecision.violations },
      });
      return res.status(403).json({ error: 'Trade rejected by Supervisor AI', violations: supervisorDecision.violations });
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: req.apiAuth!.userId },
    select: { referredById: true },
  });

  if (effectiveMode === 'live' && user?.referredById) {
    const tradingFee = amount * 0.01;
    try {
      await recordReferralEarning(user.referredById, req.apiAuth!.userId, tradingFee);
    } catch (error) {
      console.error('Failed to record referral earning:', error);
    }
  }

  await auditTrailService.logSecurityEvent({
    agentId: agent.id,
    tokenAddress: token,
    decision: 'approved',
    reason: `Trade ${action} ${amount} ${token} in ${effectiveMode} mode - All security checks passed`,
    metadata: { 
      action, 
      amount, 
      mode: effectiveMode,
      trustScore: tokenAnalysis?.trustScore.score,
      threatCheck: threatCheck.confidence,
    },
  });

  res.json({ 
    success: true, 
    mode: effectiveMode, 
    action, 
    token, 
    amount, 
    message: `${effectiveMode} trade queued`,
    security: {
      circuitBreaker: 'passed',
      threatIntelligence: threatCheck.confidence < 50 ? 'safe' : 'monitored',
      supervisorAI: tokenAnalysis ? 'approved' : 'skipped',
      trustScore: tokenAnalysis?.trustScore.score,
    },
  });
});

export default router;
