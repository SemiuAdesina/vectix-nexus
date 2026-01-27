import { randomBytes } from 'crypto';
import { TEEConfig } from './tee.types';

export function buildTEEConfig(): TEEConfig {
  const provider = (process.env.TEE_PROVIDER as TEEConfig['provider']) || 'simulated';
  const config: TEEConfig = {
    provider,
    enclaveId: process.env.TEE_ENCLAVE_ID,
  };

  if (provider === 'phala') {
    config.apiKey = process.env.PHALA_API_KEY;
    config.endpoint = process.env.PHALA_ENDPOINT || 'https://api.phala.network';
    config.attestationUrl = process.env.PHALA_ENDPOINT;
    if (!config.enclaveId && config.apiKey) {
      config.enclaveId = `phala-${randomBytes(8).toString('hex')}`;
    }
  } else if (provider === 'intel-sgx') {
    config.attestationUrl = process.env.INTEL_TRUST_AUTHORITY_URL || 'https://api.trustauthority.intel.com';
  } else if (provider === 'azure') {
    config.attestationUrl = process.env.AZURE_ATTESTATION_URL;
  } else if (provider === 'google-cloud') {
    config.endpoint = `https://${process.env.GCP_REGION}-attestation.googleapis.com`;
    config.attestationUrl = config.endpoint;
  }

  return config;
}
