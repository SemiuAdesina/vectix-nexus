export function validateProductionEnv(): void {
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) return;

  const errors: string[] = [];

  const allowTestKeys = process.env.ALLOW_TEST_KEYS_IN_PRODUCTION === 'true';
  if (process.env.ALLOW_DEPLOY_WITHOUT_SUBSCRIPTION === 'true' && !allowTestKeys) {
    errors.push('ALLOW_DEPLOY_WITHOUT_SUBSCRIPTION must not be true in production (except when ALLOW_TEST_KEYS_IN_PRODUCTION)');
  }
  const hasFlyToken = (process.env.FLY_API_TOKEN ?? '').trim() !== '';
  if (process.env.MOCK_FLY_DEPLOY === 'true' && hasFlyToken) {
    errors.push('MOCK_FLY_DEPLOY must not be true in production when FLY_API_TOKEN is set (use Fly or VPS, not both)');
  }
  if (process.env.FORCE_MOCK_DB === 'true') {
    errors.push('FORCE_MOCK_DB must not be true in production');
  }
  if (process.env.ENABLE_NARRATIVE_DEMO === 'true') {
    errors.push('ENABLE_NARRATIVE_DEMO must not be true in production');
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY ?? '';
  if (!allowTestKeys && stripeKey.startsWith('sk_test_')) {
    errors.push('Use live Stripe keys (sk_live_*) in production, not test keys');
  }

  const clerkKey = process.env.CLERK_SECRET_KEY ?? '';
  if (!allowTestKeys && clerkKey.startsWith('sk_test_')) {
    errors.push('Use production Clerk secret key in production, not test key');
  }

  const rpcUrl = process.env.SOLANA_RPC_URL ?? '';
  if (rpcUrl === 'https://api.mainnet-beta.solana.com' || rpcUrl === '') {
    errors.push('Use a paid Solana RPC (Helius, Alchemy, etc.) for production; public RPC is rate-limited');
  }

  const secretsKey = process.env.SECRETS_ENCRYPTION_KEY ?? '';
  if (secretsKey.length < 32) {
    errors.push('SECRETS_ENCRYPTION_KEY must be at least 32 characters for agent key encryption');
  }

  if (errors.length > 0) {
    throw new Error(`Production environment validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`);
  }
}
