import { getNarrativeApiConfig } from '../../config';

export interface LunarCrushCoin {
  id: number;
  symbol: string;
  name: string;
  price: number;
  percent_change_24h: number;
  galaxy_score: number;
  alt_rank: number;
  social_volume: number;
  social_score: number;
  social_contributors: number;
  social_dominance: number;
  market_cap: number;
  categories: string[];
}

export interface LunarCrushResponse {
  data: LunarCrushCoin[];
}

export class LunarCrushClient {
  private readonly apiKey: string | undefined;
  private readonly baseUrl: string;

  constructor() {
    const config = getNarrativeApiConfig();
    this.apiKey = config.lunarcrush.apiKey;
    this.baseUrl = config.lunarcrush.baseUrl;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  async getTopCoins(limit = 50): Promise<LunarCrushCoin[]> {
    if (!this.apiKey) {
      console.warn('[LunarCrush] API key not configured');
      return [];
    }
    
    try {
      const url = `${this.baseUrl}/coins/list/v2?sort=galaxy_score&limit=${limit}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[LunarCrush] API error (${res.status}):`, errorText);
        return [];
      }
      
      const data = (await res.json()) as LunarCrushResponse;
      return data.data || [];
    } catch (error) {
      console.error('[LunarCrush] Request failed:', error);
      return [];
    }
  }

  async getCoinsByCategory(category: string): Promise<LunarCrushCoin[]> {
    if (!this.apiKey) {
      console.warn('[LunarCrush] API key not configured');
      return [];
    }
    
    try {
      const url = `${this.baseUrl}/coins/list/v2?sort=social_volume&categories=${category}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[LunarCrush] API error (${res.status}):`, errorText);
        return [];
      }
      
      const data = (await res.json()) as LunarCrushResponse;
      return data.data || [];
    } catch (error) {
      console.error('[LunarCrush] Request failed:', error);
      return [];
    }
  }

  async getSocialMetrics(symbol: string): Promise<LunarCrushCoin | null> {
    if (!this.apiKey) {
      console.warn('[LunarCrush] API key not configured');
      return null;
    }
    
    try {
      const url = `${this.baseUrl}/coins/${symbol}/v1`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[LunarCrush] API error (${res.status}):`, errorText);
        return null;
      }
      
      const data = (await res.json()) as { data: LunarCrushCoin };
      return data.data || null;
    } catch (error) {
      console.error('[LunarCrush] Request failed:', error);
      return null;
    }
  }
}

export const lunarCrushClient = new LunarCrushClient();

