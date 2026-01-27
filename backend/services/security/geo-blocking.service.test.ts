import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import {
  extractCountryFromRequest,
  geoBlockingMiddleware,
  isSanctionedCountry,
} from './geo-blocking.service';

vi.mock('../audit', () => ({
  logAuditEvent: vi.fn(),
  extractContext: vi.fn(() => ({})),
}));

const createMockReq = (headers: Record<string, string> = {}): Request =>
  ({ headers, ip: '127.0.0.1' } as Request);

const createMockRes = () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as Partial<Response>;
  return res as Response;
};

describe('extractCountryFromRequest', () => {
  it('extracts country from cf-ipcountry header', () => {
    const req = createMockReq({ 'cf-ipcountry': 'US' });
    expect(extractCountryFromRequest(req)).toBe('US');
  });

  it('extracts country from x-vercel-ip-country header', () => {
    const req = createMockReq({ 'x-vercel-ip-country': 'GB' });
    expect(extractCountryFromRequest(req)).toBe('GB');
  });

  it('extracts country from x-geo-country header', () => {
    const req = createMockReq({ 'x-geo-country': 'DE' });
    expect(extractCountryFromRequest(req)).toBe('DE');
  });

  it('returns null when no country header present', () => {
    const req = createMockReq({});
    expect(extractCountryFromRequest(req)).toBeNull();
  });

  it('normalizes country code to uppercase', () => {
    const req = createMockReq({ 'cf-ipcountry': 'us' });
    expect(extractCountryFromRequest(req)).toBe('US');
  });
});

describe('geoBlockingMiddleware', () => {
  let next: NextFunction;

  beforeEach(() => {
    next = vi.fn();
  });

  it('allows requests from non-sanctioned countries', async () => {
    const req = createMockReq({ 'cf-ipcountry': 'US' });
    const res = createMockRes();
    await geoBlockingMiddleware()(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('blocks requests from sanctioned countries', async () => {
    const req = createMockReq({ 'cf-ipcountry': 'CU' });
    const res = createMockRes();
    await geoBlockingMiddleware()(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'GEO_BLOCKED' }));
  });

  it('blocks requests with unknown location by default', async () => {
    const req = createMockReq({});
    const res = createMockRes();
    await geoBlockingMiddleware()(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'GEO_UNKNOWN' }));
  });

  it('allows unknown locations when configured', async () => {
    const req = createMockReq({});
    const res = createMockRes();
    await geoBlockingMiddleware({ allowUnknown: true })(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('passes through when disabled', async () => {
    const req = createMockReq({ 'cf-ipcountry': 'CU' });
    const res = createMockRes();
    await geoBlockingMiddleware({ enabled: false })(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('isSanctionedCountry', () => {
  it('returns true for Cuba', () => {
    expect(isSanctionedCountry('CU')).toBe(true);
  });

  it('returns true for Iran', () => {
    expect(isSanctionedCountry('IR')).toBe(true);
  });

  it('returns false for United States', () => {
    expect(isSanctionedCountry('US')).toBe(false);
  });
});
