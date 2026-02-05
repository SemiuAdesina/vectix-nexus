import { Router, Request, Response } from 'express';
import { getUserIdFromRequest } from '../lib/auth';
import { requireActiveSubscription } from '../lib/subscription';
import { prisma } from '../lib/prisma';
import { createFlyMachine, getMachineIP } from '../services/fly';
import { WalletManager } from '../services/solana';
import { validateCharacter } from '../../shared/schema';
import { encryptSecrets, secretsToEnvVars, validateSecrets, AgentSecrets } from '../services/secrets';

const router = Router();

interface DeployAgentRequest {
  characterJson: Record<string, unknown> | string;
  appName?: string;
  secrets?: AgentSecrets;
}

router.post('/deploy-agent', async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    await requireActiveSubscription(userId);

    const body = req.body as DeployAgentRequest;
    if (!body.characterJson) return res.status(400).json({ success: false, error: 'characterJson is required' });

    const characterConfigString = typeof body.characterJson === 'string' ? body.characterJson : JSON.stringify(body.characterJson);
    const characterObj = JSON.parse(characterConfigString);

    const validation = validateCharacter(characterObj);
    if (!validation.success) {
      return res.status(400).json({ success: false, error: validation.error?.message || 'Invalid character configuration' });
    }

    let encryptedSecrets: string | undefined;
    let envVars: Record<string, string> = {};

    if (body.secrets) {
      const secretsValidation = validateSecrets(body.secrets);
      if (!secretsValidation.valid) {
        return res.status(400).json({ success: false, error: `Invalid secrets: ${secretsValidation.errors.join(', ')}` });
      }
      encryptedSecrets = encryptSecrets(body.secrets);
      envVars = secretsToEnvVars(body.secrets);
    }

    const walletResult = WalletManager.generateWallet();
    const appName = body.appName || process.env.FLY_APP_NAME || 'eliza-agent';

    const characterConfigWithEnv = JSON.stringify({
      ...characterObj,
      settings: { ...characterObj.settings, secrets: envVars },
    });

    const machine = await createFlyMachine(characterConfigWithEnv, appName);
    const ipAddress = machine.id ? await getMachineIP(machine.id, appName) : null;

    const agent = await prisma.agent.create({
      data: {
        userId,
        name: characterObj.name || 'Unnamed Agent',
        characterConfig: characterConfigString,
        machineId: machine.id,
        status: 'running',
        walletAddress: walletResult.wallet.address,
        encryptedSecrets,
      },
    });

    return res.status(200).json({
      success: true,
      agentId: agent.id,
      machineId: machine.id,
      ipAddress: ipAddress || undefined,
      walletAddress: walletResult.wallet.address,
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error occurred');
    console.error('[deploy-agent]', err.message, err.stack);
    const errorMessage = err.message;
    if (errorMessage.includes('subscription required')) {
      return res.status(402).json({ success: false, error: errorMessage });
    }
    return res.status(500).json({ success: false, error: errorMessage });
  }
});

export default router;

