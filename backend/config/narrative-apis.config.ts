/**
 * Narrative Analysis API Configuration
 * 
 * Add these environment variables to enable narrative cluster tracking:
 * 
 * LUNARCRUSH_API_KEY - Get from https://lunarcrush.com/developers
 * TWITTER_BEARER_TOKEN - Get from https://developer.twitter.com
 * SANTIMENT_API_KEY - Get from https://app.santiment.net/account
 */

export interface NarrativeApiConfig {
  lunarcrush: {
    apiKey: string | undefined;
    baseUrl: string;
    enabled: boolean;
  };
  twitter: {
    bearerToken: string | undefined;
    baseUrl: string;
    enabled: boolean;
  };
  santiment: {
    apiKey: string | undefined;
    baseUrl: string;
    enabled: boolean;
  };
}

export function getNarrativeApiConfig(): NarrativeApiConfig {
  return {
    lunarcrush: {
      apiKey: process.env.LUNARCRUSH_API_KEY,
      baseUrl: 'https://lunarcrush.com/api4/public',
      enabled: Boolean(process.env.LUNARCRUSH_API_KEY),
    },
    twitter: {
      bearerToken: process.env.TWITTER_BEARER_TOKEN,
      baseUrl: 'https://api.twitter.com/2',
      enabled: Boolean(process.env.TWITTER_BEARER_TOKEN),
    },
    santiment: {
      apiKey: process.env.SANTIMENT_API_KEY,
      baseUrl: 'https://api.santiment.net/graphql',
      enabled: Boolean(process.env.SANTIMENT_API_KEY),
    },
  };
}

export function isNarrativeFeatureAvailable(): boolean {
  const config = getNarrativeApiConfig();
  return config.lunarcrush.enabled || config.twitter.enabled || config.santiment.enabled;
}

export const REQUIRED_ENV_VARS = {
  LUNARCRUSH_API_KEY: 'LunarCrush API key for crypto social metrics',
  TWITTER_BEARER_TOKEN: 'Twitter API v2 bearer token for social scraping',
  SANTIMENT_API_KEY: 'Santiment API key for on-chain social data',
};

