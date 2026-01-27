import { TransactionSimulator, SimulationResult } from './transaction-simulator';
import { Transaction, VersionedTransaction } from '@solana/web3.js';
import { auditTrailService } from '../../../onchain/services/audit-trail';

export interface PreflightRequest {
  agentId: string;
  walletAddress: string;
  transaction: Transaction | VersionedTransaction;
  expectedBalanceChange: number;
  action: string;
  metadata?: Record<string, unknown>;
}

export interface PreflightDecision {
  approved: boolean;
  simulation: SimulationResult;
  action: string;
  reason: string;
  timestamp: Date;
}

export class PreflightGuard {
  private simulator: TransactionSimulator;
  private history: Map<string, PreflightDecision[]> = new Map();

  constructor(rpcUrl: string) {
    this.simulator = new TransactionSimulator(rpcUrl);
  }

  async evaluate(request: PreflightRequest): Promise<PreflightDecision> {
    const simulation = await this.simulator.simulate(
      request.transaction,
      request.walletAddress,
      request.expectedBalanceChange
    );

    const decision: PreflightDecision = {
      approved: simulation.approved,
      simulation,
      action: request.action,
      reason: this.buildReason(simulation),
      timestamp: new Date(),
    };

    await this.recordDecision(request.agentId, decision);
    return decision;
  }

  private buildReason(sim: SimulationResult): string {
    if (!sim.success) return 'Simulation failed - transaction blocked for safety';
    if (sim.riskFlags.length === 0) return 'All checks passed';

    const critical = sim.riskFlags.filter(f => f.severity === 'critical');
    if (critical.length > 0) {
      return `Blocked: ${critical.map(f => f.message).join('; ')}`;
    }

    return `Approved with warnings: ${sim.riskFlags.map(f => f.message).join('; ')}`;
  }

  private async recordDecision(agentId: string, decision: PreflightDecision): Promise<void> {
    const agentHistory = this.history.get(agentId) || [];
    agentHistory.push(decision);
    if (agentHistory.length > 100) agentHistory.shift();
    this.history.set(agentId, agentHistory);

    try {
      await auditTrailService.logSecurityEvent({
        agentId,
        decision: decision.approved ? 'approved' : 'rejected',
        reason: decision.reason,
        metadata: {
          action: decision.action,
          simulation: {
            success: decision.simulation.success,
            riskFlags: decision.simulation.riskFlags.length,
          },
        },
      });
    } catch (error) {
      console.error('Failed to log preflight decision to audit trail:', error);
    }
  }

  getHistory(agentId: string): PreflightDecision[] {
    return this.history.get(agentId) || [];
  }

  getStats(agentId: string): { total: number; approved: number; blocked: number; blockedReasons: string[] } {
    const history = this.getHistory(agentId);
    const blocked = history.filter(d => !d.approved);

    return {
      total: history.length,
      approved: history.filter(d => d.approved).length,
      blocked: blocked.length,
      blockedReasons: blocked.map(d => d.reason),
    };
  }
}

let preflightGuardInstance: PreflightGuard | null = null;

export function getPreflightGuard(): PreflightGuard {
  if (!preflightGuardInstance) {
    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    preflightGuardInstance = new PreflightGuard(rpcUrl);
  }
  return preflightGuardInstance;
}

