export interface TEEStatus {
  available: boolean;
  provider: string;
  enclaveId: string | null;
  attestationValid: boolean;
  keyCount: number;
}

export interface NarrativeToken {
  address: string;
  symbol: string;
  name: string;
  mentions: number;
  sentiment: number;
  priceChange24h: number;
  socialScore: number;
}

export interface NarrativeCluster {
  id: string;
  name: string;
  keywords: string[];
  tokens: NarrativeToken[];
  mentionCount: number;
  growthRate: number;
  sentiment: number;
  heatScore: number;
  updatedAt: string;
}

export interface NarrativeSignal {
  clusterId: string;
  clusterName: string;
  signalType: 'HEATING_UP' | 'COOLING_DOWN' | 'BREAKOUT' | 'ROTATION';
  strength: number;
  topTokens: string[];
  message: string;
  timestamp: string;
}

export interface NarrativeStatus {
  available: boolean;
  demoMode?: boolean;
  message: string;
}
