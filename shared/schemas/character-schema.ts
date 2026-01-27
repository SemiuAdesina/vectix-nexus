import { z } from 'zod';

export const uuidSchema = z
  .string()
  .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'Invalid UUID format')
  .describe('Unique identifier for the character in UUID format');

export const styleSchema = z
  .object({
    all: z
      .array(z.string())
      .optional()
      .describe('Style guidelines applied to all types of responses'),
    chat: z
      .array(z.string())
      .optional()
      .describe('Style guidelines specific to chat/conversation responses'),
    post: z
      .array(z.string())
      .optional()
      .describe('Style guidelines specific to social media posts'),
  })
  .optional()
  .describe('Style configuration defining how the character communicates across different contexts');

export const settingsSchema = z
  .record(
    z.string(),
    z.union([z.string(), z.boolean(), z.number(), z.object({}).passthrough(), z.array(z.unknown())])
  )
  .optional()
  .describe('Character-specific settings like avatar URL, preferences, and configuration');

export const secretsSchema = z
  .record(z.string(), z.union([z.string(), z.boolean(), z.number()]))
  .optional()
  .describe('Secret values and API keys (should not be committed to version control)');

export const characterSchema = z
  .object({
    id: uuidSchema.optional().describe('Unique identifier for the character'),
    name: z
      .string()
      .min(1, 'Character name is required')
      .describe('The name of the character (e.g., "Eliza")'),
    username: z.string().optional().describe('Username for the character on various platforms'),
    system: z
      .string()
      .optional()
      .describe("System prompt that defines the character's core behavior and response style"),
    templates: z
      .record(z.string(), z.union([z.string(), z.function().optional()]))
      .optional()
      .describe('Custom templates for generating different types of content'),
    bio: z
      .union([z.string(), z.array(z.string())])
      .describe('Character biography - can be a single string or array of biographical points'),
    messageExamples: z
      .array(z.array(z.object({
        name: z.string(),
        content: z.object({}).catchall(z.unknown()),
      })))
      .optional()
      .describe('Example conversations showing how the character responds in different scenarios'),
    postExamples: z
      .array(z.string())
      .optional()
      .describe("Example social media posts demonstrating the character's voice and topics"),
    topics: z
      .array(z.string())
      .optional()
      .describe('Topics the character is knowledgeable about and engages with'),
    adjectives: z
      .array(z.string())
      .optional()
      .describe("Adjectives that describe the character's personality and traits"),
    knowledge: z
      .array(z.union([
        z.string(),
        z.object({
          path: z.string(),
          shared: z.boolean().optional(),
        }),
        z.object({
          directory: z.string(),
          shared: z.boolean().optional(),
        }),
      ]))
      .optional()
      .describe('Knowledge sources (files, directories) the character can reference'),
    plugins: z
      .array(z.string())
      .optional()
      .describe(
        'List of plugin package names to load (e.g., ["@elizaos/plugin-sql", "@elizaos/plugin-bootstrap"] - these are commonly required)'
      ),
    settings: settingsSchema,
    secrets: secretsSchema,
    style: styleSchema,
  })
  .strict()
  .describe('Complete character definition including personality, behavior, and capabilities');

export type Character = z.infer<typeof characterSchema>;
