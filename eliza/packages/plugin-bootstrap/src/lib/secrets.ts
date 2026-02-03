import * as fs from 'fs';
import * as path from 'path';

export interface HackathonSecrets {
  apiKey: string;
  claimCode: string;
  agentId?: number;
  registeredName?: string;
  claimUrl?: string;
  agentName?: string;
  registeredAt?: string;
}

export function readHackathonSecrets(): HackathonSecrets | null {
  try {
    const secretsPath = path.join(process.cwd(), 'hackathon_secrets.json');

    if (!fs.existsSync(secretsPath)) {
      return null;
    }

    const data = fs.readFileSync(secretsPath, 'utf-8');
    return JSON.parse(data) as HackathonSecrets;
  } catch (error) {
    console.error('Failed to read hackathon secrets:', error);
    return null;
  }
}
