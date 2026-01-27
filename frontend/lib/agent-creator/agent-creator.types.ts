export type RiskLevel = 'Low' | 'Medium' | 'High';

export type TradingStrategy = 'Copy Trader' | 'Sniper' | 'HODLer';

export interface AgentCreatorFormData {
  name: string;
  bio: string;
  tickerSymbol: string;
  riskLevel: RiskLevel;
  tradingStrategy: TradingStrategy;
}

export interface CharacterConfig {
  name: string;
  bio: string | string[];
  system?: string;
  adjectives?: string[];
  topics?: string[];
  settings?: Record<string, unknown>;
  plugins?: string[];
  style?: {
    all?: string[];
    chat?: string[];
    post?: string[];
  };
}

