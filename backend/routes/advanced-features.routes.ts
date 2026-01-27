import { Router, Request, Response } from 'express';
import { getPreflightGuard } from '../services/simulation/preflight-guard';
import { RuleEngine } from '../services/supervisor/rule-engine';
import { ShadowPortfolioManager } from '../services/shadow/shadow-portfolio';
import { getSecureEnclave } from '../services/tee/secure-enclave';
import { fetchTokenByAddress } from '../services/security/dexscreener-client';

const router = Router();
const ruleEngine = new RuleEngine();
const shadowManager = new ShadowPortfolioManager();

router.get('/preflight/stats/:agentId', (req: Request, res: Response) => {
  const stats = getPreflightGuard().getStats(req.params.agentId);
  res.json({ success: true, stats });
});

router.post('/supervisor/evaluate', (req: Request, res: Response) => {
  const decision = ruleEngine.evaluate(req.body);
  res.json({ success: true, decision });
});

router.get('/supervisor/rules', (_req: Request, res: Response) => {
  res.json({ success: true, rules: ruleEngine.getRules() });
});

router.put('/supervisor/rules/:ruleId', (req: Request, res: Response) => {
  ruleEngine.updateRule(req.params.ruleId, req.body);
  res.json({ success: true, message: 'Rule updated' });
});

router.post('/shadow/create', (req: Request, res: Response) => {
  const { agentId, startingSol } = req.body;
  const portfolio = shadowManager.create(agentId, startingSol);
  res.json({ success: true, portfolio: { ...portfolio, holdings: [] } });
});

router.post('/shadow/trade', (req: Request, res: Response) => {
  const { agentId, ...trade } = req.body;
  const result = shadowManager.executeTrade(agentId, trade);
  res.json({ success: !!result, trade: result });
});

router.get('/shadow/report/:agentId', (req: Request, res: Response) => {
  const report = shadowManager.generateReport(req.params.agentId);
  res.json({ success: !!report, report });
});

router.post('/shadow/stop/:agentId', (req: Request, res: Response) => {
  shadowManager.stopShadowMode(req.params.agentId);
  res.json({ success: true, message: 'Shadow mode stopped' });
});

router.post('/shadow/update-prices/:agentId', async (req: Request, res: Response) => {
  try {
    const portfolio = shadowManager.getPortfolio(req.params.agentId);
    if (!portfolio || !portfolio.isActive) {
      return res.status(404).json({ success: false, error: 'Portfolio not found or inactive' });
    }

    const priceMap = new Map<string, number>();
    const tokenAddresses = Array.from(portfolio.holdings.keys());

    // Fetch live prices from DexScreener for all holdings
    const pricePromises = tokenAddresses.map(async (address) => {
      try {
        const tokenData = await fetchTokenByAddress(address);
        if (tokenData && tokenData.priceUsd > 0) {
          // Convert USD price to SOL price (approximate, using $100/SOL)
          const solPrice = tokenData.priceUsd / 100;
          return [address, solPrice] as [string, number];
        }
      } catch (error) {
        console.error(`Failed to fetch price for ${address}:`, error);
      }
      return null;
    });

    const prices = await Promise.all(pricePromises);
    for (const price of prices) {
      if (price) priceMap.set(price[0], price[1]);
    }

    shadowManager.updatePrices(req.params.agentId, priceMap);
    const updatedPortfolio = shadowManager.getPortfolio(req.params.agentId);
    res.json({ success: true, portfolio: updatedPortfolio });
  } catch (error) {
    console.error('Error updating shadow prices:', error);
    res.status(500).json({ success: false, error: 'Failed to update prices' });
  }
});

router.get('/tee/status', async (_req: Request, res: Response) => {
  const status = await getSecureEnclave().getStatus();
  res.json({ success: true, status });
});

router.post('/tee/store-key', async (req: Request, res: Response) => {
  const { agentId, privateKey } = req.body;
  const keyId = await getSecureEnclave().storeKey(agentId, new Uint8Array(Buffer.from(privateKey, 'base64')));
  res.json({ success: true, keyId, message: 'Key stored in secure enclave' });
});

router.delete('/tee/key/:keyId', async (req: Request, res: Response) => {
  const { agentId } = req.body;
  const deleted = await getSecureEnclave().deleteKey(req.params.keyId, agentId);
  res.json({ success: deleted });
});

export default router;

