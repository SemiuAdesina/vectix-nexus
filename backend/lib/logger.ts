type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  requestId?: string;
  userId?: string;
  duration?: number;
  metadata?: Record<string, unknown>;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const CURRENT_LEVEL = LOG_LEVELS[
  (process.env.LOG_LEVEL as LogLevel) || 'info'
];

const COLORS = {
  debug: '\x1b[36m',
  info: '\x1b[32m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
  reset: '\x1b[0m',
};

function formatLog(entry: LogEntry): string {
  const color = COLORS[entry.level];
  const reset = COLORS.reset;
  const levelTag = `[${entry.level.toUpperCase()}]`.padEnd(7);
  const ctx = entry.context ? `[${entry.context}]` : '';
  const reqId = entry.requestId ? `req:${entry.requestId.slice(0, 8)}` : '';
  const user = entry.userId ? `user:${entry.userId.slice(0, 8)}` : '';
  const duration = entry.duration ? `${entry.duration}ms` : '';
  
  const tags = [ctx, reqId, user, duration].filter(Boolean).join(' ');
  const prefix = tags ? `${tags} ` : '';
  
  return `${color}${levelTag}${reset} ${entry.timestamp} ${prefix}${entry.message}`;
}

function createLogEntry(
  level: LogLevel,
  message: string,
  options?: Partial<Omit<LogEntry, 'level' | 'message' | 'timestamp'>>
): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...options,
  };
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= CURRENT_LEVEL;
}

function log(entry: LogEntry): void {
  if (!shouldLog(entry.level)) return;
  
  const formatted = formatLog(entry);
  const method = entry.level === 'error' ? 'error' : entry.level === 'warn' ? 'warn' : 'log';
  
  console[method](formatted);
  
  if (entry.metadata && Object.keys(entry.metadata).length > 0) {
    console[method]('  └─', JSON.stringify(entry.metadata));
  }
}

export const logger = {
  debug: (message: string, options?: Partial<Omit<LogEntry, 'level' | 'message' | 'timestamp'>>) =>
    log(createLogEntry('debug', message, options)),
    
  info: (message: string, options?: Partial<Omit<LogEntry, 'level' | 'message' | 'timestamp'>>) =>
    log(createLogEntry('info', message, options)),
    
  warn: (message: string, options?: Partial<Omit<LogEntry, 'level' | 'message' | 'timestamp'>>) =>
    log(createLogEntry('warn', message, options)),
    
  error: (message: string, options?: Partial<Omit<LogEntry, 'level' | 'message' | 'timestamp'>>) =>
    log(createLogEntry('error', message, options)),
    
  request: (method: string, path: string, options?: { requestId?: string; userId?: string }) =>
    log(createLogEntry('info', `${method} ${path}`, { context: 'HTTP', ...options })),
    
  response: (method: string, path: string, status: number, duration: number, options?: { requestId?: string }) =>
    log(createLogEntry(status >= 400 ? 'warn' : 'info', `${method} ${path} ${status}`, { 
      context: 'HTTP', 
      duration,
      ...options 
    })),
};

export type Logger = typeof logger;
