import { describe, it, expect } from 'vitest';
import { validateCharacter, parseAndValidateCharacter, isValidCharacter } from './validation';
import { characterSchema } from './character-schema';

describe('Character Validation', () => {
  describe('validateCharacter', () => {
    it('validates valid character data', () => {
      const validCharacter = {
        name: 'Test Character',
        bio: 'A test character',
        system: 'You are a test character',
      };

      const result = validateCharacter(validCharacter);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.name).toBe('Test Character');
    });

    it('rejects invalid character data', () => {
      const invalidCharacter = {
        name: '',
        bio: 'Test',
      };

      const result = validateCharacter(invalidCharacter);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('validation failed');
    });

    it('validates character with all optional fields', () => {
      const fullCharacter = {
        name: 'Full Character',
        bio: 'A full character',
        system: 'You are a full character',
        username: 'fullchar',
        topics: ['topic1', 'topic2'],
        adjectives: ['friendly', 'helpful'],
        plugins: ['@elizaos/plugin-sql'],
        settings: { avatar: 'https://example.com/avatar.png' },
        style: {
          all: ['Be helpful'],
          chat: ['Use emojis'],
        },
      };

      const result = validateCharacter(fullCharacter);
      expect(result.success).toBe(true);
      expect(result.data?.topics).toEqual(['topic1', 'topic2']);
    });
  });

  describe('parseAndValidateCharacter', () => {
    it('parses and validates JSON string', () => {
      const jsonString = JSON.stringify({
        name: 'JSON Character',
        bio: 'A character from JSON',
      });

      const result = parseAndValidateCharacter(jsonString);
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('JSON Character');
    });

    it('handles invalid JSON', () => {
      const invalidJson = '{ invalid json }';
      const result = parseAndValidateCharacter(invalidJson);
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Invalid JSON');
    });
  });

  describe('isValidCharacter', () => {
    it('returns true for valid character', () => {
      const validCharacter = {
        name: 'Valid Character',
        bio: 'Valid bio',
      };

      expect(isValidCharacter(validCharacter)).toBe(true);
    });

    it('returns false for invalid character', () => {
      const invalidCharacter = {
        name: '',
        bio: 'Test',
      };

      expect(isValidCharacter(invalidCharacter)).toBe(false);
    });
  });
});
