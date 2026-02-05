import { describe, it } from "node:test";
import assert from "node:assert";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import {
  REAL_TREASURY,
  LICENSE_FEE_LAMPORTS,
  RENT_BUFFER,
  canAffordLicense,
  loadWalletFromEnv,
} from "./pay-license.mjs";

const LAMPORTS_PER_SOL = 1e9;

describe("pay-license", () => {
  describe("constants", () => {
    it("license fee is 0.05 SOL in lamports", () => {
      assert.strictEqual(LICENSE_FEE_LAMPORTS, 0.05 * LAMPORTS_PER_SOL);
    });

    it("REAL_TREASURY is a non-empty string", () => {
      assert.strictEqual(typeof REAL_TREASURY, "string");
      assert.ok(REAL_TREASURY.length > 0);
    });
  });

  describe("canAffordLicense", () => {
    it("returns false when balance is zero", () => {
      assert.strictEqual(canAffordLicense(0), false);
    });

    it("returns false when balance is below fee + buffer", () => {
      assert.strictEqual(canAffordLicense(LICENSE_FEE_LAMPORTS), false);
      assert.strictEqual(canAffordLicense(LICENSE_FEE_LAMPORTS + RENT_BUFFER - 1), false);
    });

    it("returns true when balance equals fee + buffer", () => {
      assert.strictEqual(canAffordLicense(LICENSE_FEE_LAMPORTS + RENT_BUFFER), true);
    });

    it("returns true when balance exceeds fee + buffer", () => {
      assert.strictEqual(canAffordLicense(LICENSE_FEE_LAMPORTS + RENT_BUFFER + 1), true);
    });
  });

  describe("loadWalletFromEnv", () => {
    it("throws when SOLANA_PRIVATE_KEY is not set", () => {
      const orig = process.env.SOLANA_PRIVATE_KEY;
      try {
        delete process.env.SOLANA_PRIVATE_KEY;
        assert.throws(() => loadWalletFromEnv(), /SOLANA_PRIVATE_KEY not found/);
      } finally {
        if (orig !== undefined) process.env.SOLANA_PRIVATE_KEY = orig;
      }
    });

    it("loads keypair from base58 secret", () => {
      const kp = Keypair.generate();
      const encoded = bs58.encode(kp.secretKey);
      const prev = process.env.SOLANA_PRIVATE_KEY;
      process.env.SOLANA_PRIVATE_KEY = encoded;
      try {
        const loaded = loadWalletFromEnv();
        assert.strictEqual(loaded.publicKey.toString(), kp.publicKey.toString());
      } finally {
        if (prev !== undefined) process.env.SOLANA_PRIVATE_KEY = prev;
        else delete process.env.SOLANA_PRIVATE_KEY;
      }
    });

    it("loads keypair from JSON array secret", () => {
      const kp = Keypair.generate();
      const arr = "[" + Array.from(kp.secretKey).join(",") + "]";
      const prev = process.env.SOLANA_PRIVATE_KEY;
      process.env.SOLANA_PRIVATE_KEY = arr;
      try {
        const loaded = loadWalletFromEnv();
        assert.strictEqual(loaded.publicKey.toString(), kp.publicKey.toString());
      } finally {
        if (prev !== undefined) process.env.SOLANA_PRIVATE_KEY = prev;
        else delete process.env.SOLANA_PRIVATE_KEY;
      }
    });
  });
});
