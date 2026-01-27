import type { AgentCreatorFormData, CharacterConfig, RiskLevel, TradingStrategy } from './agent-creator.types';

const ESSENTIAL_PLUGINS = ['@elizaos/plugin-sql', '@elizaos/plugin-bootstrap'];

function getAdjectivesFromRiskLevel(riskLevel: RiskLevel): string[] {
  const riskAdjectives: Record<RiskLevel, string[]> = {
    Low: ['conservative', 'cautious', 'analytical'],
    Medium: ['balanced', 'strategic', 'measured'],
    High: ['degen', 'risk-taker', 'aggressive'],
  };
  return riskAdjectives[riskLevel];
}

function buildSystemPrompt(
  tradingStrategy: TradingStrategy,
  riskLevel: RiskLevel,
  tickerSymbol: string
): string {
  const basePrompt = `You are a trading agent focused on ${tickerSymbol}. Your risk tolerance is ${riskLevel}.`;
  
  const strategyPrompts: Record<TradingStrategy, string> = {
    'Copy Trader': 'You monitor and replicate successful trading patterns from top performers. Focus on volume, momentum, and social sentiment.',
    'Sniper': 'You prioritize volume spikes and rapid price movements. Execute trades quickly when opportunities arise, focusing on short-term gains and market momentum.',
    'HODLer': 'You take a long-term perspective. Focus on fundamental analysis, ignore short-term volatility, and build positions over time.',
  };

  return `${basePrompt} ${strategyPrompts[tradingStrategy]}`;
}

function getTopicsFromStrategy(tradingStrategy: TradingStrategy): string[] {
  const strategyTopics: Record<TradingStrategy, string[]> = {
    'Copy Trader': ['social trading', 'momentum', 'sentiment analysis'],
    'Sniper': ['volume analysis', 'price action', 'market volatility'],
    'HODLer': ['fundamental analysis', 'long-term trends', 'value investing'],
  };
  return strategyTopics[tradingStrategy];
}

export function generateCharacterConfig(formData: AgentCreatorFormData): string {
  const adjectives = getAdjectivesFromRiskLevel(formData.riskLevel);
  const systemPrompt = buildSystemPrompt(formData.tradingStrategy, formData.riskLevel, formData.tickerSymbol);
  const topics = getTopicsFromStrategy(formData.tradingStrategy);

  const characterConfig: CharacterConfig = {
    name: formData.name,
    bio: formData.bio.split('\n').filter((line) => line.trim().length > 0),
    system: systemPrompt,
    adjectives,
    topics,
    plugins: ESSENTIAL_PLUGINS,
    settings: {
      tickerSymbol: formData.tickerSymbol,
      riskLevel: formData.riskLevel,
      tradingStrategy: formData.tradingStrategy,
    },
    style: {
      all: ['professional', 'clear', 'concise'],
    },
  };

  return JSON.stringify(characterConfig, null, 2);
}

