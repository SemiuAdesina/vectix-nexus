import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from './logger';

describe('logger', () => {
  const consoleSpy = {
    log: vi.spyOn(console, 'log').mockImplementation(() => {}),
    warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
    error: vi.spyOn(console, 'error').mockImplementation(() => {}),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('log levels', () => {
    it('logs info messages', () => {
      logger.info('Test info message');
      expect(consoleSpy.log).toHaveBeenCalled();
      expect(consoleSpy.log.mock.calls[0][0]).toContain('[INFO]');
    });

    it('logs warn messages', () => {
      logger.warn('Test warning');
      expect(consoleSpy.warn).toHaveBeenCalled();
      expect(consoleSpy.warn.mock.calls[0][0]).toContain('[WARN]');
    });

    it('logs error messages', () => {
      logger.error('Test error');
      expect(consoleSpy.error).toHaveBeenCalled();
      expect(consoleSpy.error.mock.calls[0][0]).toContain('[ERROR]');
    });
  });

  describe('context and metadata', () => {
    it('includes context in log output', () => {
      logger.info('Test message', { context: 'TEST' });
      expect(consoleSpy.log.mock.calls[0][0]).toContain('[TEST]');
    });

    it('includes requestId in log output', () => {
      logger.info('Test message', { requestId: 'req-12345678' });
      expect(consoleSpy.log.mock.calls[0][0]).toContain('req:req-1234');
    });

    it('includes userId in log output', () => {
      logger.info('Test message', { userId: 'user-12345678' });
      expect(consoleSpy.log.mock.calls[0][0]).toContain('user:user-123');
    });

    it('logs metadata as JSON', () => {
      logger.info('Test message', { metadata: { key: 'value' } });
      expect(consoleSpy.log).toHaveBeenCalledTimes(2);
    });
  });

  describe('request/response logging', () => {
    it('logs HTTP requests', () => {
      logger.request('GET', '/api/test');
      expect(consoleSpy.log).toHaveBeenCalled();
      expect(consoleSpy.log.mock.calls[0][0]).toContain('[HTTP]');
      expect(consoleSpy.log.mock.calls[0][0]).toContain('GET /api/test');
    });

    it('logs successful responses', () => {
      logger.response('GET', '/api/test', 200, 50);
      expect(consoleSpy.log).toHaveBeenCalled();
      expect(consoleSpy.log.mock.calls[0][0]).toContain('200');
      expect(consoleSpy.log.mock.calls[0][0]).toContain('50ms');
    });

    it('logs error responses as warnings', () => {
      logger.response('GET', '/api/test', 404, 10);
      expect(consoleSpy.warn).toHaveBeenCalled();
      expect(consoleSpy.warn.mock.calls[0][0]).toContain('404');
    });
  });
});
