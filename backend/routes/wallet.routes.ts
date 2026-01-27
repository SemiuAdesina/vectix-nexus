import { Router, Request, Response } from 'express';
import { getUserIdFromRequest } from '../lib/auth';
import { prisma } from '../lib/prisma';
import { WalletManager } from '../services/solana';
import { decryptSecrets } from '../services/secrets';
import { getWalletBalance, withdrawFunds, validateWalletAddress } from '../services/solana-balance';
import { requestWithdrawal, verifyWithdrawalToken } from '../services/withdrawal-confirm.service';

const router = Router();

router.get('/agents/:id/balance', async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const agent = await prisma.agent.findFirst({ where: { id: req.params.id, userId } });
    if (!agent?.walletAddress) return res.status(404).json({ error: 'Agent or wallet not found' });

    const balance = await getWalletBalance(agent.walletAddress);
    return res.json({ balance });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: errorMessage });
  }
});

router.post('/agents/:id/withdraw/request', async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const agent = await prisma.agent.findFirst({
      where: { id: req.params.id, userId },
      include: { user: true },
    });
    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    const { destinationAddress } = req.body as { destinationAddress?: string };
    const withdrawAddress = destinationAddress || agent.user.walletAddress;
    if (!withdrawAddress) {
      return res.status(400).json({ error: 'No destination wallet provided' });
    }

    const isValid = await validateWalletAddress(withdrawAddress);
    if (!isValid) return res.status(400).json({ error: 'Invalid Solana address' });

    const { token, expiresAt } = await requestWithdrawal(userId, agent.id, withdrawAddress);
    return res.json({
      success: true,
      message: 'Confirmation sent to your email. Use the token to complete withdrawal.',
      expiresAt,
      tokenHint: token.slice(0, 8) + '...',
    });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/agents/:id/withdraw/confirm', async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { token } = req.body as { token: string };
    if (!token) return res.status(400).json({ error: 'Confirmation token required' });

    const agent = await prisma.agent.findFirst({
      where: { id: req.params.id, userId },
      include: { user: true },
    });
    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    const verification = verifyWithdrawalToken(token, userId, agent.id);
    if (!verification.valid) {
      return res.status(403).json({ error: verification.error });
    }

    if (!agent.encryptedSecrets) return res.status(400).json({ error: 'Agent wallet not configured' });
    const secrets = decryptSecrets(agent.encryptedSecrets);
    if (!secrets.customEnvVars?.AGENT_ENCRYPTED_PRIVATE_KEY) {
      return res.status(400).json({ error: 'Agent wallet key not found' });
    }

    const result = await withdrawFunds({
      encryptedPrivateKey: secrets.customEnvVars.AGENT_ENCRYPTED_PRIVATE_KEY,
      destinationAddress: verification.destination!,
    });
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
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

router.get('/user/wallet', async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.json({ walletAddress: user.walletAddress });
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

