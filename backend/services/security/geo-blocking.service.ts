import { Request, Response, NextFunction } from 'express';
import { SANCTIONED_COUNTRY_CODES } from './ofac-sdn.service';
import { logAuditEvent, extractContext } from '../audit';

export interface GeoBlockConfig {
  enabled: boolean;
  blockedCountries: Set<string>;
  allowUnknown: boolean;
}

const DEFAULT_CONFIG: GeoBlockConfig = {
  enabled: process.env.GEO_BLOCKING_ENABLED !== 'false',
  blockedCountries: SANCTIONED_COUNTRY_CODES,
  allowUnknown: false,
};

export function extractCountryFromRequest(req: Request): string | null {
  const cfCountry = req.headers['cf-ipcountry'] as string;
  if (cfCountry) return cfCountry.toUpperCase();

  const xCountry = req.headers['x-vercel-ip-country'] as string;
  if (xCountry) return xCountry.toUpperCase();

  const geoHeader = req.headers['x-geo-country'] as string;
  if (geoHeader) return geoHeader.toUpperCase();

  return null;
}

export function geoBlockingMiddleware(config: Partial<GeoBlockConfig> = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  return async (req: Request, res: Response, next: NextFunction) => {
    if (!cfg.enabled) return next();

    const country = extractCountryFromRequest(req);

    if (!country && !cfg.allowUnknown) {
      return res.status(403).json({
        error: 'Access denied',
        code: 'GEO_UNKNOWN',
        message: 'Unable to verify geographic location',
      });
    }

    if (country && cfg.blockedCountries.has(country)) {
      const context = extractContext(req);
      await logAuditEvent(
        'security.sanctions_check',
        context,
        { blockedCountry: country, reason: 'OFAC sanctioned jurisdiction' },
        false,
        'Access blocked from sanctioned country'
      );

      return res.status(403).json({
        error: 'Service unavailable in your region',
        code: 'GEO_BLOCKED',
      });
    }

    next();
  };
}

export function isSanctionedCountry(countryCode: string): boolean {
  return SANCTIONED_COUNTRY_CODES.has(countryCode.toUpperCase());
}
