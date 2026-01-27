export type AuditAction =
  | 'auth.login'
  | 'auth.logout'
  | 'auth.login_failed'
  | 'auth.token_refresh'
  | 'user.create'
  | 'user.update'
  | 'user.delete'
  | 'agent.create'
  | 'agent.start'
  | 'agent.stop'
  | 'agent.delete'
  | 'agent.config_update'
  | 'wallet.create'
  | 'wallet.withdraw_request'
  | 'wallet.withdraw_confirm'
  | 'wallet.withdraw_complete'
  | 'api_key.create'
  | 'api_key.revoke'
  | 'api_key.use'
  | 'strategy.purchase'
  | 'strategy.create'
  | 'subscription.create'
  | 'subscription.cancel'
  | 'security.sanctions_check'
  | 'security.mev_protection_toggle'
  | 'security.bug_report'
  | 'admin.user_suspend'
  | 'admin.config_change';

export type AuditSeverity = 'info' | 'warning' | 'critical';

export interface AuditContext {
  userId?: string;
  agentId?: string;
  resourceType?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  sessionId?: string;
}

export interface AuditMetadata {
  previousValue?: unknown;
  newValue?: unknown;
  reason?: string;
  duration?: number;
  [key: string]: unknown;
}

export interface AuditEntry {
  id: string;
  timestamp: Date;
  action: AuditAction;
  severity: AuditSeverity;
  context: AuditContext;
  metadata: AuditMetadata;
  success: boolean;
  errorMessage?: string;
}

export interface AuditQueryParams {
  userId?: string;
  action?: AuditAction;
  severity?: AuditSeverity;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}
