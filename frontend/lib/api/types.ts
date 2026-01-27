export interface AgentSecrets {
  openaiApiKey?: string;
  anthropicApiKey?: string;
  twitterUsername?: string;
  twitterPassword?: string;
  twitterEmail?: string;
  discordToken?: string;
  telegramToken?: string;
  customEnvVars?: Record<string, string>;
}

export interface DeployAgentRequest {
  characterJson: Record<string, unknown> | string;
  appName?: string;
  secrets?: AgentSecrets;
}

export interface DeployAgentResponse {
  success: boolean;
  agentId?: string;
  machineId?: string;
  ipAddress?: string;
  walletAddress?: string;
  error?: string;
}

export interface Agent {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  machineId?: string;
  walletAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentStatus {
  status: string;
  region: string;
  updatedAt: string;
}

export interface LogEntry {
  timestamp: string;
  message: string;
  level: 'info' | 'warn' | 'error';
  source: string;
}

export interface LogsResponse {
  logs: LogEntry[];
  nextToken?: string;
}

export interface WalletBalance {
  sol: number;
  lamports: number;
}

export interface WithdrawResult {
  success: boolean;
  signature?: string;
  amountSol?: number;
  error?: string;
}

export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  plan?: string;
  planName?: string;
  subscriptionId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: string;
  status?: string;
}

export interface PricingPlan {
  name: string;
  price: number;
  priceId: string;
  features: string[];
}

