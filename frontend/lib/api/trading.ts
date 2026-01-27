import { getAuthHeaders, getBackendUrl } from './auth';
import { API_ENDPOINTS } from './config';

const BACKEND_URL = getBackendUrl();

export type TradeAction = 'buy' | 'sell';
export type TradeMode = 'paper' | 'live';

export interface TradeRequest {
  action: TradeAction;
  token: string;
  amount: number;
  mode?: TradeMode;
}

export interface TradeResult {
  success: boolean;
  mode: TradeMode;
  action: TradeAction;
  token: string;
  amount: number;
  message: string;
}

export interface TrendingToken {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
}

export interface MarketDataResult {
  delayed: boolean;
  dataTimestamp: string;
  message: string;
  tokens: TrendingToken[];
}

export async function executeTrade(agentId: string, trade: TradeRequest): Promise<TradeResult> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}${API_ENDPOINTS.publicApi.trade(agentId)}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(trade),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Trade execution failed');
  return data as TradeResult;
}

export async function getTrendingTokens(apiKey: string): Promise<MarketDataResult> {
  const response = await fetch(`${BACKEND_URL}${API_ENDPOINTS.publicApi.trending}`, {
    headers: { 'x-api-key': apiKey },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch market data');
  return data as MarketDataResult;
}
