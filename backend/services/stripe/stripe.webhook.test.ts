import { describe, it, expect, vi } from 'vitest';

vi.mock('./stripe.config', () => ({
  stripe: null,
  WebhookEventData: {},
}));

import { handleWebhookEvent } from './stripe.webhook';

describe('handleWebhookEvent', () => {
  it('throws error when stripe is not configured', async () => {
    const payload = Buffer.from('{}');
    const signature = 'test_signature';

    await expect(handleWebhookEvent(payload, signature)).rejects.toThrow(
      'Stripe not configured'
    );
  });
});
