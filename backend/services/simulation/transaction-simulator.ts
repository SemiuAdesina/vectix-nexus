import { Connection, Transaction, VersionedTransaction, PublicKey } from '@solana/web3.js';

export interface SimulationResult {
  success: boolean;
  approved: boolean;
  balanceChange: number;
  expectedChange: number;
  slippagePercent: number;
  riskFlags: RiskFlag[];
  logs: string[];
}

export interface RiskFlag {
  type: 'HIGH_SLIPPAGE' | 'DRAINER_DETECTED' | 'UNKNOWN_PROGRAM' | 'EXCESSIVE_LOSS';
  severity: 'warning' | 'critical';
  message: string;
}

interface SimulationConfig {
  maxSlippagePercent: number;
  maxLossPercent: number;
  blockedPrograms: string[];
}

const DEFAULT_CONFIG: SimulationConfig = {
  maxSlippagePercent: 15,
  maxLossPercent: 50,
  blockedPrograms: [],
};

const KNOWN_DRAINER_PROGRAMS = new Set([
  'DrainXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
]);

export class TransactionSimulator {
  private connection: Connection;
  private config: SimulationConfig;

  constructor(rpcUrl: string, config: Partial<SimulationConfig> = {}) {
    this.connection = new Connection(rpcUrl, 'confirmed');
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async simulate(
    transaction: Transaction | VersionedTransaction,
    walletAddress: string,
    expectedBalanceChange: number
  ): Promise<SimulationResult> {
    const riskFlags: RiskFlag[] = [];
    const logs: string[] = [];

    try {
      const walletPubkey = new PublicKey(walletAddress);
      const preBalance = await this.connection.getBalance(walletPubkey);

      const simResult = await this.connection.simulateTransaction(
        transaction as VersionedTransaction,
        { sigVerify: false }
      );

      if (simResult.value.err) {
        return this.createFailedResult(simResult.value.err.toString(), riskFlags);
      }

      logs.push(...(simResult.value.logs || []));
      this.detectDrainerPrograms(logs, riskFlags);

      const postBalance = preBalance;
      const actualChange = (postBalance - preBalance) / 1e9;
      const slippage = this.calculateSlippage(actualChange, expectedBalanceChange);

      if (slippage > this.config.maxSlippagePercent) {
        riskFlags.push({
          type: 'HIGH_SLIPPAGE',
          severity: slippage > 50 ? 'critical' : 'warning',
          message: `Slippage ${slippage.toFixed(1)}% exceeds maximum ${this.config.maxSlippagePercent}%`,
        });
      }

      const lossPercent = Math.abs(Math.min(0, actualChange) / (preBalance / 1e9)) * 100;
      if (lossPercent > this.config.maxLossPercent) {
        riskFlags.push({
          type: 'EXCESSIVE_LOSS',
          severity: 'critical',
          message: `Transaction would result in ${lossPercent.toFixed(1)}% portfolio loss`,
        });
      }

      const hasCritical = riskFlags.some(f => f.severity === 'critical');

      return {
        success: true,
        approved: !hasCritical,
        balanceChange: actualChange,
        expectedChange: expectedBalanceChange,
        slippagePercent: slippage,
        riskFlags,
        logs,
      };
    } catch (error) {
      return this.createFailedResult(error instanceof Error ? error.message : 'Simulation failed', riskFlags);
    }
  }

  private detectDrainerPrograms(logs: string[], flags: RiskFlag[]): void {
    for (const log of logs) {
      for (const drainer of KNOWN_DRAINER_PROGRAMS) {
        if (log.includes(drainer)) {
          flags.push({
            type: 'DRAINER_DETECTED',
            severity: 'critical',
            message: 'Known drainer contract detected - transaction blocked',
          });
          return;
        }
      }
    }
  }

  private calculateSlippage(actual: number, expected: number): number {
    if (expected === 0) return 0;
    return Math.abs((actual - expected) / expected) * 100;
  }

  private createFailedResult(error: string, flags: RiskFlag[]): SimulationResult {
    return {
      success: false,
      approved: false,
      balanceChange: 0,
      expectedChange: 0,
      slippagePercent: 0,
      riskFlags: [...flags, { type: 'UNKNOWN_PROGRAM', severity: 'critical', message: error }],
      logs: [],
    };
  }
}

