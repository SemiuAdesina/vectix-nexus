import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const result = dotenv.config({ path: envPath, override: true });
if (result.error) console.warn('dotenv load failed:', result.error.message);
else console.log('Loaded .env from', envPath);

const hasKey = Boolean(process.env.OPIK_API_KEY?.trim());
console.log('OPIK_API_KEY set:', hasKey);

if (!hasKey) {
  console.log('Set OPIK_API_KEY in backend/.env to send traces.');
  process.exit(1);
}

const { getOpik } = require('../lib/opik');
const client = getOpik();
if (!client) {
  console.log('Opik client failed to initialize.');
  process.exit(1);
}

const trace = client.trace({
  name: 'opik-smoke-test',
  input: { check: true },
});
trace.update({ output: { ok: true } });
trace.end();
console.log('Opik trace created and ended. Check your Comet project "vectix-foundry".');
process.exit(0);
