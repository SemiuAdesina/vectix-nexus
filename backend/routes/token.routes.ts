import { Router, Request, Response } from 'express';
import { getUserIdFromRequest } from '../lib/auth';
import { prisma } from '../lib/prisma';
import { Keypair, Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, sendAndConfirmTransaction } from '@solana/web3.js';

const router = Router();

const PUMP_FUN_PROGRAM_ID = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P');
const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const TREASURY_WALLET = process.env.TREASURY_WALLET_ADDRESS || '';
const TREASURY_PERCENTAGE = 0.01;

interface LaunchTokenRequest {
  agentId: string;
  tokenName: string;
  symbol: string;
  imageUrl?: string;
}

router.post('/agents/:id/launch-token', async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { id } = req.params;
    const { tokenName, symbol, imageUrl } = req.body as LaunchTokenRequest;

    if (!tokenName || !symbol) {
      return res.status(400).json({ success: false, error: 'tokenName and symbol are required' });
    }

    const agent = await prisma.agent.findFirst({ where: { id, userId } });
    if (!agent) return res.status(404).json({ success: false, error: 'Agent not found' });
    if (!agent.walletAddress) return res.status(400).json({ success: false, error: 'Agent has no wallet' });

    const connection = new Connection(RPC_URL, 'confirmed');
    const agentWallet = Keypair.generate();

    const totalSupply = 1_000_000_000;
    const treasuryAmount = Math.floor(totalSupply * TREASURY_PERCENTAGE);

    const transaction = new Transaction();

    transaction.add(
      SystemProgram.transfer({
        fromPubkey: agentWallet.publicKey,
        toPubkey: PUMP_FUN_PROGRAM_ID,
        lamports: 0.1 * LAMPORTS_PER_SOL,
      })
    );

    if (TREASURY_WALLET) {
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: agentWallet.publicKey,
          toPubkey: new PublicKey(TREASURY_WALLET),
          lamports: treasuryAmount,
        })
      );
    }

    const tokenMint = agentWallet.publicKey.toBase58();

    return res.status(200).json({
      success: true,
      tokenMint,
      tokenName,
      symbol,
      totalSupply,
      treasuryAmount,
      treasuryPercentage: TREASURY_PERCENTAGE * 100,
      message: 'Token launch initiated (simulation mode - needs SOL funding)',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ success: false, error: errorMessage });
  }
});

router.get('/agents/:id/token', async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { id } = req.params;
    const agent = await prisma.agent.findFirst({ where: { id, userId } });
    if (!agent) return res.status(404).json({ success: false, error: 'Agent not found' });

    return res.status(200).json({
      success: true,
      hasToken: false,
      tokenMint: null,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ success: false, error: errorMessage });
  }
});

export default router;

