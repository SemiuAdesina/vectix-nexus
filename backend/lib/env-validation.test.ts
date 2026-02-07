import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { validateProductionEnv } from './env-validation';

describe('validateProductionEnv', () => {
  const origNodeEnv = process.env.NODE_ENV;
  const origAllow = process.env.ALLOW_DEPLOY_WITHOUT_SUBSCRIPTION;
  const origMock = process.env.MOCK_FLY_DEPLOY;
  const origFlyToken = process.env.FLY_API_TOKEN;
  const origNarrativeDemo = process.env.ENABLE_NARRATIVE_DEMO;
  const origStripe = process.env.STRIPE_SECRET_KEY;
  const origClerk = process.env.CLERK_SECRET_KEY;
  const origRpc = process.env.SOLANA_RPC_URL;

  afterEach(() => {
    process.env.NODE_ENV = origNodeEnv;
    process.env.ALLOW_DEPLOY_WITHOUT_SUBSCRIPTION = origAllow;
    process.env.MOCK_FLY_DEPLOY = origMock;
    process.env.FLY_API_TOKEN = origFlyToken;
    process.env.ENABLE_NARRATIVE_DEMO = origNarrativeDemo;
    process.env.STRIPE_SECRET_KEY = origStripe;
    process.env.CLERK_SECRET_KEY = origClerk;
    process.env.SOLANA_RPC_URL = origRpc;
  });

  it('passes when NODE_ENV is development', () => {
    process.env.NODE_ENV = 'development';
    process.env.ALLOW_DEPLOY_WITHOUT_SUBSCRIPTION = 'true';
    expect(() => validateProductionEnv()).not.toThrow();
  });

  it('throws when production and ALLOW_DEPLOY_WITHOUT_SUBSCRIPTION is true', () => {
    process.env.NODE_ENV = 'production';
    process.env.ALLOW_DEPLOY_WITHOUT_SUBSCRIPTION = 'true';
    process.env.MOCK_FLY_DEPLOY = 'false';
    process.env.STRIPE_SECRET_KEY = 'sk_live_xxx';
    process.env.CLERK_SECRET_KEY = 'sk_live_xxx';
    process.env.SOLANA_RPC_URL = 'https://mainnet.helius-rpc.com';
    process.env.SECRETS_ENCRYPTION_KEY = 'a'.repeat(32);
    expect(() => validateProductionEnv()).toThrow(/ALLOW_DEPLOY_WITHOUT_SUBSCRIPTION/);
  });

  it('throws when production has both MOCK_FLY_DEPLOY and FLY_API_TOKEN set', () => {
    process.env.NODE_ENV = 'production';
    process.env.ALLOW_DEPLOY_WITHOUT_SUBSCRIPTION = 'false';
    process.env.MOCK_FLY_DEPLOY = 'true';
    process.env.FLY_API_TOKEN = 'fly-token';
    process.env.STRIPE_SECRET_KEY = 'sk_live_xxx';
    process.env.CLERK_SECRET_KEY = 'sk_live_xxx';
    process.env.SOLANA_RPC_URL = 'https://mainnet.helius-rpc.com';
    process.env.SECRETS_ENCRYPTION_KEY = 'a'.repeat(32);
    expect(() => validateProductionEnv()).toThrow(/MOCK_FLY_DEPLOY|FLY_API_TOKEN/);
  });

  it('passes when production has MOCK_FLY_DEPLOY true and no FLY_API_TOKEN (VPS)', () => {
    process.env.NODE_ENV = 'production';
    process.env.ALLOW_DEPLOY_WITHOUT_SUBSCRIPTION = 'false';
    process.env.MOCK_FLY_DEPLOY = 'true';
    delete process.env.FLY_API_TOKEN;
    process.env.ENABLE_NARRATIVE_DEMO = 'false';
    process.env.STRIPE_SECRET_KEY = 'sk_live_xxx';
    process.env.CLERK_SECRET_KEY = 'sk_live_xxx';
    process.env.SOLANA_RPC_URL = 'https://mainnet.helius-rpc.com';
    process.env.SECRETS_ENCRYPTION_KEY = 'a'.repeat(32);
    expect(() => validateProductionEnv()).not.toThrow();
  });

  it('throws when production and ENABLE_NARRATIVE_DEMO is true', () => {
    process.env.NODE_ENV = 'production';
    process.env.ALLOW_DEPLOY_WITHOUT_SUBSCRIPTION = 'false';
    process.env.MOCK_FLY_DEPLOY = 'true';
    delete process.env.FLY_API_TOKEN;
    process.env.ENABLE_NARRATIVE_DEMO = 'true';
    process.env.STRIPE_SECRET_KEY = 'sk_live_xxx';
    process.env.CLERK_SECRET_KEY = 'sk_live_xxx';
    process.env.SOLANA_RPC_URL = 'https://mainnet.helius-rpc.com';
    process.env.SECRETS_ENCRYPTION_KEY = 'a'.repeat(32);
    expect(() => validateProductionEnv()).toThrow(/ENABLE_NARRATIVE_DEMO/);
  });
});
