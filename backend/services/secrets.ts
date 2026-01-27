import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

function getSecretsKey(): Buffer {
  const secret = process.env.SECRETS_ENCRYPTION_KEY;
  if (!secret) {
    throw new Error('SECRETS_ENCRYPTION_KEY environment variable must be set');
  }
  return crypto.createHash('sha256').update(secret).digest();
}

function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha256');
}

export interface AgentSecrets {
  openaiApiKey?: string;
  anthropicApiKey?: string;
  twitterUsername?: string;
  twitterPassword?: string;
  twitterEmail?: string;
  discordToken?: string;
  telegramToken?: string;
  customEnvVars?: Record<string, string>;
}

export function encryptSecrets(secrets: AgentSecrets): string {
  const masterKey = getSecretsKey();
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = deriveKey(masterKey.toString('hex'), salt);

  const plaintext = JSON.stringify(secrets);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  const combined = Buffer.concat([salt, iv, tag, encrypted]);
  return combined.toString('base64');
}

export function decryptSecrets(encryptedSecrets: string): AgentSecrets {
  const masterKey = getSecretsKey();
  const combined = Buffer.from(encryptedSecrets, 'base64');

  const salt = combined.subarray(0, SALT_LENGTH);
  const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = combined.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

  const key = deriveKey(masterKey.toString('hex'), salt);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = decipher.update(encrypted) + decipher.final('utf8');
  return JSON.parse(decrypted) as AgentSecrets;
}

export function secretsToEnvVars(secrets: AgentSecrets): Record<string, string> {
  const envVars: Record<string, string> = {};

  if (secrets.openaiApiKey) {
    envVars.OPENAI_API_KEY = secrets.openaiApiKey;
  }
  if (secrets.anthropicApiKey) {
    envVars.ANTHROPIC_API_KEY = secrets.anthropicApiKey;
  }
  if (secrets.twitterUsername) {
    envVars.TWITTER_USERNAME = secrets.twitterUsername;
  }
  if (secrets.twitterPassword) {
    envVars.TWITTER_PASSWORD = secrets.twitterPassword;
  }
  if (secrets.twitterEmail) {
    envVars.TWITTER_EMAIL = secrets.twitterEmail;
  }
  if (secrets.discordToken) {
    envVars.DISCORD_TOKEN = secrets.discordToken;
  }
  if (secrets.telegramToken) {
    envVars.TELEGRAM_BOT_TOKEN = secrets.telegramToken;
  }

  if (secrets.customEnvVars) {
    Object.entries(secrets.customEnvVars).forEach(([key, value]) => {
      envVars[key] = value;
    });
  }

  return envVars;
}

export function validateSecrets(secrets: AgentSecrets): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!secrets.openaiApiKey && !secrets.anthropicApiKey) {
    errors.push('At least one AI provider API key (OpenAI or Anthropic) is required');
  }

  if (secrets.openaiApiKey && !secrets.openaiApiKey.startsWith('sk-')) {
    errors.push('Invalid OpenAI API key format');
  }

  if (secrets.anthropicApiKey && !secrets.anthropicApiKey.startsWith('sk-ant-')) {
    errors.push('Invalid Anthropic API key format');
  }

  if (secrets.twitterUsername && !secrets.twitterPassword) {
    errors.push('Twitter password required when username is provided');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

