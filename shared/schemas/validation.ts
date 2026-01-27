import { z } from 'zod';
import { characterSchema, type Character } from './character-schema';

export interface CharacterValidationResult {
  success: boolean;
  data?: Character;
  error?: {
    message: string;
    issues?: z.ZodIssue[];
  };
}

export function validateCharacter(data: unknown): CharacterValidationResult {
  const result = characterSchema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  return {
    success: false,
    error: {
      message: `Character validation failed: ${result.error.message}`,
      issues: result.error.issues,
    },
  };
}

export function parseAndValidateCharacter(jsonString: string): CharacterValidationResult {
  try {
    const parsed = JSON.parse(jsonString);
    return validateCharacter(parsed);
  } catch (error) {
    return {
      success: false,
      error: {
        message: `Invalid JSON: ${error instanceof Error ? error.message : 'Unknown JSON parsing error'}`,
      },
    };
  }
}

export function isValidCharacter(data: unknown): data is Character {
  return validateCharacter(data).success;
}
