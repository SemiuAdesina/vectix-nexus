import { Router, Request, Response } from 'express';
import { getPreflightGuard } from '../services/simulation/preflight-guard';
import { RuleEngine } from '../services/supervisor/rule-engine';
import { ShadowPortfolioManager } from '../services/shadow/shadow-portfolio';
import { getSecureEnclave } from '../services/tee/secure-enclave';

const router = Router();
const ruleEngine = new RuleEngine();
const shadowManager = new ShadowPortfolioManager();

router.get('/preflight/stats/:agentId', (req: Request, res: Response) => {
  const agentId = Array.isArray(req.params.agentId) ? req.params.agentId[0] : req.params.agentId;
  const stats = getPreflightGuard().getStats(agentId);
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
  const ruleId = Array.isArray(req.params.ruleId) ? req.params.ruleId[0] : req.params.ruleId;
  ruleEngine.updateRule(ruleId, req.body);
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
  const agentId = Array.isArray(req.params.agentId) ? req.params.agentId[0] : req.params.agentId;
  const report = shadowManager.generateReport(agentId);
  res.json({ success: !!report, report });
});

router.post('/shadow/stop/:agentId', (req: Request, res: Response) => {
  const agentId = Array.isArray(req.params.agentId) ? req.params.agentId[0] : req.params.agentId;
  shadowManager.stopShadowMode(agentId);
  res.json({ success: true, message: 'Shadow mode stopped' });
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
  const keyId = Array.isArray(req.params.keyId) ? req.params.keyId[0] : req.params.keyId;
  const deleted = await getSecureEnclave().deleteKey(keyId, agentId);
  res.json({ success: deleted });
});

export default router;

