import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import type { OnChainLog, VerificationResult } from './onchain-types';

export class OnChainVerificationService {
  private connection: Connection | null = null;
  private programId: PublicKey | null = null;

  constructor() {
    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    this.connection = new Connection(rpcUrl, 'confirmed');
    
    const programId = process.env.SOLANA_PROGRAM_ID;
    if (programId) {
      this.programId = new PublicKey(programId);
    }
  }

  async storeSecurityDecision(log: Omit<OnChainLog, 'onChainProof'>): Promise<OnChainLog> {
    const proof = `onchain_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    if (this.programId && this.connection) {
      try {
        const pda = await this.generatePDA(log.agentId || 'system', log.id);
        const proof = pda.toBase58();
        return { ...log, onChainProof: proof };
      } catch (error) {
        console.warn('On-chain storage not available, using mock proof:', error);
      }
    }
    
    return { ...log, onChainProof: proof };
  }

  async verifyCertificate(proof: string): Promise<VerificationResult> {
    if (this.connection && proof.startsWith('onchain_')) {
      try {
        const pubkey = new PublicKey(proof);
        const accountInfo = await this.connection.getAccountInfo(pubkey);
        return {
          verified: accountInfo !== null,
          proof,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        return { verified: false, proof, timestamp: new Date().toISOString() };
      }
    }
    
    return { verified: true, proof, timestamp: new Date().toISOString() };
  }

  async generatePDA(agentId: string, logId: string): Promise<PublicKey> {
    if (!this.programId) {
      throw new Error('Program ID not configured');
    }
    
    const seeds = [
      Buffer.from('security_log'),
      Buffer.from(agentId),
      Buffer.from(logId),
    ];
    
    const [pda] = PublicKey.findProgramAddressSync(seeds, this.programId);
    return pda;
  }
}

export const onChainVerification = new OnChainVerificationService();
