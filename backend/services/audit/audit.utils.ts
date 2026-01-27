import { Request } from 'express';
import { AuditContext } from './audit.types';
import { SENSITIVE_KEYS } from './audit.config';

export function redactSensitiveData(data: unknown): unknown {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(item => redactSensitiveData(item));
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
      result[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      result[key] = redactSensitiveData(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export function extractContext(req: Request, userId?: string): AuditContext {
  return {
    userId,
    ipAddress: req.ip || req.socket?.remoteAddress || 'unknown',
    userAgent: (req.headers['user-agent'] || 'unknown').substring(0, 256),
    requestId: req.headers['x-request-id'] as string,
    sessionId: req.headers['x-session-id'] as string,
  };
}
