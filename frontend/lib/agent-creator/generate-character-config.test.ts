import { generateCharacterConfig } from './generate-character-config';
import type { AgentCreatorFormData } from './agent-creator.types';

describe('generateCharacterConfig', () => {
  const baseFormData: AgentCreatorFormData = {
    name: 'TestAgent',
    bio: 'A test trading agent\nMulti-line bio',
    tickerSymbol: '$GOAT',
    riskLevel: 'Medium',
    tradingStrategy: 'Copy Trader',
  };

  it('should generate valid JSON for Medium risk Copy Trader', () => {
    const result = generateCharacterConfig(baseFormData);
    const parsed = JSON.parse(result);

    expect(parsed.name).toBe('TestAgent');
    expect(parsed.bio).toEqual(['A test trading agent', 'Multi-line bio']);
    expect(parsed.adjectives).toEqual(['balanced', 'strategic', 'measured']);
    expect(parsed.topics).toEqual(['social trading', 'momentum', 'sentiment analysis']);
    expect(parsed.plugins).toEqual(['@elizaos/plugin-sql', '@elizaos/plugin-bootstrap']);
    expect(parsed.settings?.tickerSymbol).toBe('$GOAT');
    expect(parsed.settings?.riskLevel).toBe('Medium');
    expect(parsed.settings?.tradingStrategy).toBe('Copy Trader');
    expect(parsed.system).toContain('$GOAT');
    expect(parsed.system).toContain('Medium');
  });

  it('should include degen and risk-taker for High risk level', () => {
    const formData: AgentCreatorFormData = { ...baseFormData, riskLevel: 'High' };
    const result = generateCharacterConfig(formData);
    const parsed = JSON.parse(result);

    expect(parsed.adjectives).toContain('degen');
    expect(parsed.adjectives).toContain('risk-taker');
    expect(parsed.adjectives).toContain('aggressive');
  });

  it('should include conservative adjectives for Low risk level', () => {
    const formData: AgentCreatorFormData = { ...baseFormData, riskLevel: 'Low' };
    const result = generateCharacterConfig(formData);
    const parsed = JSON.parse(result);

    expect(parsed.adjectives).toEqual(['conservative', 'cautious', 'analytical']);
  });

  it('should generate Sniper-specific system prompt with volume spike prioritization', () => {
    const formData: AgentCreatorFormData = { ...baseFormData, tradingStrategy: 'Sniper' };
    const result = generateCharacterConfig(formData);
    const parsed = JSON.parse(result);

    expect(parsed.system).toContain('volume spikes');
    expect(parsed.topics).toEqual(['volume analysis', 'price action', 'market volatility']);
  });

  it('should generate HODLer-specific configuration', () => {
    const formData: AgentCreatorFormData = { ...baseFormData, tradingStrategy: 'HODLer' };
    const result = generateCharacterConfig(formData);
    const parsed = JSON.parse(result);

    expect(parsed.system).toContain('long-term');
    expect(parsed.topics).toEqual(['fundamental analysis', 'long-term trends', 'value investing']);
  });

  it('should handle single-line bio correctly', () => {
    const formData: AgentCreatorFormData = { ...baseFormData, bio: 'Single line bio' };
    const result = generateCharacterConfig(formData);
    const parsed = JSON.parse(result);

    expect(parsed.bio).toEqual(['Single line bio']);
  });

  it('should filter empty bio lines', () => {
    const formData: AgentCreatorFormData = {
      ...baseFormData,
      bio: 'Line 1\n\nLine 2\n   \nLine 3',
    };
    const result = generateCharacterConfig(formData);
    const parsed = JSON.parse(result);

    expect(parsed.bio).toEqual(['Line 1', 'Line 2', 'Line 3']);
  });

  it('should output valid JSON string', () => {
    const result = generateCharacterConfig(baseFormData);
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it('should include style configuration', () => {
    const result = generateCharacterConfig(baseFormData);
    const parsed = JSON.parse(result);

    expect(parsed.style).toBeDefined();
    expect(parsed.style?.all).toEqual(['professional', 'clear', 'concise']);
  });
});

