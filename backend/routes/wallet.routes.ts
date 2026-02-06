import { Router, Request, Response } from 'express';
import { getUserIdFromRequest } from '../lib/auth';
import { prisma } from '../lib/prisma';
import { WalletManager } from '../services/solana';
import { decryptSecrets } from '../services/secrets';
import { getWalletBalance, withdrawFunds, validateWalletAddress } from '../services/solana-balance';
import { checkWithdrawalAllowed } from '../services/security/whitelist.service';
import { checkAmlCompliance, recordTransaction } from '../services/security/aml-monitoring.service';
import { logAuditEvent } from '../services/audit';
import { checkWithdrawalAmount, MAX_WITHDRAWAL_PER_TX_SOL } from '../lib/withdrawal-limits';
import { getParam } from '../lib/route-helpers';

const router = Router();

router.get('/agents/:id/balance', async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const agent = await prisma.agent.findFirst({ where: { id: getParam(req, 'id'), userId } });
    if (!agent?.walletAddress) return res.status(404).json({ error: 'Agent or wallet not found' });

    const balance = await getWalletBalance(agent.walletAddress);
    return res.json({ balance });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: errorMessage });
  }
});

router.post('/agents/:id/withdraw', async (req: Request, res: Response) => {
  const agentId = getParam(req, 'id');
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const agent = await prisma.agent.findFirst({
      where: { id: agentId, userId },
      include: { user: true },
    });

    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    const { destinationAddress } = req.body as { destinationAddress?: string };
    const withdrawAddress = destinationAddress || agent.user.walletAddress;

    if (!withdrawAddress) {
      return res.status(400).json({ error: 'No destination wallet. Set a wallet address in your profile or provide one.' });
    }

    const whitelistCheck = await checkWithdrawalAllowed(agentId, withdrawAddress);
    if (!whitelistCheck.allowed) {
      await logAuditEvent('wallet.withdraw_blocked', { userId, agentId }, { reason: whitelistCheck.reason }, false);
      return res.status(403).json({ error: whitelistCheck.reason });
    }

    const isValidAddress = await validateWalletAddress(withdrawAddress);
    if (!isValidAddress) return res.status(400).json({ error: 'Invalid Solana wallet address' });

    if (!agent.encryptedSecrets) return res.status(400).json({ error: 'Agent wallet not configured' });

    if (!agent.walletAddress) return res.status(400).json({ error: 'Agent wallet not found' });
    const balance = await getWalletBalance(agent.walletAddress);
    const estimatedAmount = Math.max(0, balance.sol - 0.001);
    const limitCheck = checkWithdrawalAmount(estimatedAmount);
    if (!limitCheck.allowed) {
      return res.status(400).json({ error: limitCheck.reason });
    }

    const amlResult = await checkAmlCompliance(userId, estimatedAmount, 'withdrawal');
    if (!amlResult.allowed) {
      await logAuditEvent('wallet.withdraw_aml_blocked', { userId, agentId }, { reason: amlResult.reason, flags: amlResult.flags }, false);
      return res.status(403).json({ error: amlResult.reason });
    }

    const secrets = decryptSecrets(agent.encryptedSecrets);
    if (!secrets.customEnvVars?.AGENT_ENCRYPTED_PRIVATE_KEY) {
      return res.status(400).json({ error: 'Agent wallet key not found' });
    }

    const result = await withdrawFunds({
      encryptedPrivateKey: secrets.customEnvVars.AGENT_ENCRYPTED_PRIVATE_KEY,
      destinationAddress: withdrawAddress,
    });

    if (result.success && result.amountSol) {
      recordTransaction({ userId, amount: result.amountSol, timestamp: Date.now(), type: 'withdrawal' });
      await logAuditEvent('wallet.withdraw_complete', { userId, agentId }, { amount: result.amountSol, destination: withdrawAddress, signature: result.signature }, true);
    }

    return res.json(result);
  } catch (error) {
    await logAuditEvent('wallet.withdraw_error', { agentId }, { error: error instanceof Error ? error.message : 'Unknown' }, false);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: errorMessage });
  }
});

router.put('/user/wallet', async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { walletAddress } = req.body as { walletAddress: string };
    if (!walletAddress) return res.status(400).json({ error: 'Wallet address is required' });

    const isValid = await validateWalletAddress(walletAddress);
    if (!isValid) return res.status(400).json({ error: 'Invalid Solana wallet address' });

    await prisma.user.update({ where: { id: userId }, data: { walletAddress } });
    return res.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: errorMessage });
  }
});

router.post('/generate-wallet', async (req: Request, res: Response) => {
  try {
    const body = req.body as { masterSecret?: string };
    const masterSecret = body.masterSecret || process.env.WALLET_MASTER_SECRET;
    const result = WalletManager.generateWallet(masterSecret);

    return res.status(200).json({ success: true, wallet: result.wallet, pluginConfig: result.pluginConfig });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ success: false, error: errorMessage });
  }
});

export default router;

