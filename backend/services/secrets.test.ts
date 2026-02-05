import { describe, it, expect, beforeEach } from 'vitest';
import * as secrets from './secrets';

describe('secrets', () => {
  beforeEach(() => {
    process.env.SECRETS_ENCRYPTION_KEY = 'test-encryption-key-32-chars-long!!';
  });

  describe('encryptSecrets and decryptSecrets', () => {
    it('encrypts and decrypts secrets correctly', () => {
      const originalSecrets: secrets.AgentSecrets = {
        openaiApiKey: 'sk-test123',
        anthropicApiKey: 'sk-ant-test456',
        twitterUsername: 'testuser',
        customEnvVars: { CUSTOM_KEY: 'custom_value' },
      };

      const encrypted = secrets.encryptSecrets(originalSecrets);
      expect(encrypted).toBeTruthy();
      expect(typeof encrypted).toBe('string');

      const decrypted = secrets.decryptSecrets(encrypted);
      expect(decrypted).toEqual(originalSecrets);
    });

    it('handles empty secrets', () => {
      const originalSecrets: secrets.AgentSecrets = {};
      const encrypted = secrets.encryptSecrets(originalSecrets);
      const decrypted = secrets.decryptSecrets(encrypted);
      expect(decrypted).toEqual({});
    });
  });

  describe('secretsToEnvVars', () => {
    it('converts secrets to environment variables', () => {
      const testSecrets: secrets.AgentSecrets = {
        openaiApiKey: 'sk-test123',
        anthropicApiKey: 'sk-ant-test456',
        twitterUsername: 'testuser',
        twitterPassword: 'password123',
        discordToken: 'discord-token',
        telegramToken: 'telegram-token',
        customEnvVars: { CUSTOM_KEY: 'custom_value' },
      };

      const envVars = secrets.secretsToEnvVars(testSecrets);
      expect(envVars.OPENAI_API_KEY).toBe('sk-test123');
      expect(envVars.ANTHROPIC_API_KEY).toBe('sk-ant-test456');
      expect(envVars.TWITTER_USERNAME).toBe('testuser');
      expect(envVars.CUSTOM_KEY).toBe('custom_value');
    });
  });

  describe('validateSecrets', () => {
    it('validates secrets with at least one AI key', () => {
      const testSecrets: secrets.AgentSecrets = {
        openaiApiKey: 'sk-test123',
      };
      const result = secrets.validateSecrets(testSecrets);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('allows empty secrets for demo mode', () => {
      const testSecrets: secrets.AgentSecrets = {};
      const result = secrets.validateSecrets(testSecrets);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects invalid OpenAI key format', () => {
      const testSecrets: secrets.AgentSecrets = { openaiApiKey: 'invalid-key' };
      const result = secrets.validateSecrets(testSecrets);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('OpenAI'))).toBe(true);
    });

    it('rejects invalid Anthropic key format', () => {
      const testSecrets: secrets.AgentSecrets = { anthropicApiKey: 'invalid-key' };
      const result = secrets.validateSecrets(testSecrets);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Anthropic'))).toBe(true);
    });

    it('validates Twitter credentials', () => {
      const testSecrets: secrets.AgentSecrets = {
        openaiApiKey: 'sk-test123',
        twitterUsername: 'testuser',
      };
      const result = secrets.validateSecrets(testSecrets);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Twitter password'))).toBe(true);
    });
  });
});
