"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.characterSchema = exports.secretsSchema = exports.settingsSchema = exports.styleSchema = exports.uuidSchema = void 0;
exports.validateCharacter = validateCharacter;
exports.parseAndValidateCharacter = parseAndValidateCharacter;
exports.isValidCharacter = isValidCharacter;
const zod_1 = require("zod");
exports.uuidSchema = zod_1.z
    .string()
    .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'Invalid UUID format')
    .describe('Unique identifier for the character in UUID format');
exports.styleSchema = zod_1.z
    .object({
    all: zod_1.z
        .array(zod_1.z.string())
        .optional()
        .describe('Style guidelines applied to all types of responses'),
    chat: zod_1.z
        .array(zod_1.z.string())
        .optional()
        .describe('Style guidelines specific to chat/conversation responses'),
    post: zod_1.z
        .array(zod_1.z.string())
        .optional()
        .describe('Style guidelines specific to social media posts'),
})
    .optional()
    .describe('Style configuration defining how the character communicates across different contexts');
exports.settingsSchema = zod_1.z
    .record(zod_1.z.string(), zod_1.z.union([zod_1.z.string(), zod_1.z.boolean(), zod_1.z.number(), zod_1.z.object({}).passthrough(), zod_1.z.array(zod_1.z.unknown())]))
    .optional()
    .describe('Character-specific settings like avatar URL, preferences, and configuration');
exports.secretsSchema = zod_1.z
    .record(zod_1.z.string(), zod_1.z.union([zod_1.z.string(), zod_1.z.boolean(), zod_1.z.number()]))
    .optional()
    .describe('Secret values and API keys (should not be committed to version control)');
exports.characterSchema = zod_1.z
    .object({
    id: exports.uuidSchema.optional().describe('Unique identifier for the character'),
    name: zod_1.z
        .string()
        .min(1, 'Character name is required')
        .describe('The name of the character (e.g., "Eliza")'),
    username: zod_1.z.string().optional().describe('Username for the character on various platforms'),
    system: zod_1.z
        .string()
        .optional()
        .describe("System prompt that defines the character's core behavior and response style"),
    templates: zod_1.z
        .record(zod_1.z.string(), zod_1.z.union([zod_1.z.string(), zod_1.z.function().optional()]))
        .optional()
        .describe('Custom templates for generating different types of content'),
    bio: zod_1.z
        .union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())])
        .describe('Character biography - can be a single string or array of biographical points'),
    messageExamples: zod_1.z
        .array(zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        content: zod_1.z.object({}).catchall(zod_1.z.unknown()),
    })))
        .optional()
        .describe('Example conversations showing how the character responds in different scenarios'),
    postExamples: zod_1.z
        .array(zod_1.z.string())
        .optional()
        .describe("Example social media posts demonstrating the character's voice and topics"),
    topics: zod_1.z
        .array(zod_1.z.string())
        .optional()
        .describe('Topics the character is knowledgeable about and engages with'),
    adjectives: zod_1.z
        .array(zod_1.z.string())
        .optional()
        .describe("Adjectives that describe the character's personality and traits"),
    knowledge: zod_1.z
        .array(zod_1.z.union([
        zod_1.z.string(),
        zod_1.z.object({
            path: zod_1.z.string(),
            shared: zod_1.z.boolean().optional(),
        }),
        zod_1.z.object({
            directory: zod_1.z.string(),
            shared: zod_1.z.boolean().optional(),
        }),
    ]))
        .optional()
        .describe('Knowledge sources (files, directories) the character can reference'),
    plugins: zod_1.z
        .array(zod_1.z.string())
        .optional()
        .describe('List of plugin package names to load (e.g., ["@elizaos/plugin-sql", "@elizaos/plugin-bootstrap"] - these are commonly required)'),
    settings: exports.settingsSchema,
    secrets: exports.secretsSchema,
    style: exports.styleSchema,
})
    .strict()
    .describe('Complete character definition including personality, behavior, and capabilities');
function validateCharacter(data) {
    const result = exports.characterSchema.safeParse(data);
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
function parseAndValidateCharacter(jsonString) {
    try {
        const parsed = JSON.parse(jsonString);
        return validateCharacter(parsed);
    }
    catch (error) {
        return {
            success: false,
            error: {
                message: `Invalid JSON: ${error instanceof Error ? error.message : 'Unknown JSON parsing error'}`,
            },
        };
    }
}
function isValidCharacter(data) {
    return validateCharacter(data).success;
}
