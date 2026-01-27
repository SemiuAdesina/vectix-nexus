import { AuditAction, AuditSeverity } from './audit.types';

export const ACTION_SEVERITY_MAP: Record<AuditAction, AuditSeverity> = {
  'auth.login': 'info',
  'auth.logout': 'info',
  'auth.login_failed': 'warning',
  'auth.token_refresh': 'info',
  'user.create': 'info',
  'user.update': 'info',
  'user.delete': 'critical',
  'agent.create': 'info',
  'agent.start': 'info',
  'agent.stop': 'info',
  'agent.delete': 'warning',
  'agent.config_update': 'info',
  'wallet.create': 'info',
  'wallet.withdraw_request': 'warning',
  'wallet.withdraw_confirm': 'critical',
  'wallet.withdraw_complete': 'critical',
  'api_key.create': 'info',
  'api_key.revoke': 'warning',
  'api_key.use': 'info',
  'strategy.purchase': 'info',
  'strategy.create': 'info',
  'subscription.create': 'info',
  'subscription.cancel': 'warning',
  'security.sanctions_check': 'info',
  'security.mev_protection_toggle': 'info',
  'security.bug_report': 'warning',
  'admin.user_suspend': 'critical',
  'admin.config_change': 'critical',
};

export const SENSITIVE_KEYS = [
  'password', 'secret', 'token', 'privateKey', 'apiKey',
  'encryptedSecrets', 'authorization', 'cookie',
];

export const MAX_MEMORY_ENTRIES = 10000;

export const SECURITY_ACTIONS: AuditAction[] = [
  'auth.login',
  'auth.login_failed',
  'wallet.withdraw_request',
  'wallet.withdraw_complete',
  'api_key.create',
  'api_key.revoke',
];
