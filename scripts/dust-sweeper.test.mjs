import { describe, it } from "node:test";
import assert from "node:assert";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import {
  loadKeypair,
  getSweepDecision,
  DUST_THRESHOLD,
  FEE_BUFFER,
} from "./dust-sweeper.mjs";

describe("loadKeypair", () => {
  it("loads keypair from base58 64-byte secret", () => {
    const kp = Keypair.generate();
    const encoded = bs58.encode(kp.secretKey);
    const loaded = loadKeypair(encoded);
    assert.strictEqual(loaded.publicKey.toString(), kp.publicKey.toString());
  });

  it("loads keypair from base58 32-byte seed", () => {
    const kp = Keypair.generate();
    const seed = kp.secretKey.slice(0, 32);
    const encoded = bs58.encode(seed);
    const loaded = loadKeypair(encoded);
    assert.strictEqual(loaded.publicKey.toString(), kp.publicKey.toString());
  });

  it("loads keypair from comma-separated 64 bytes", () => {
    const kp = Keypair.generate();
    const arr = Array.from(kp.secretKey);
    const loaded = loadKeypair(arr.join(","));
    assert.strictEqual(loaded.publicKey.toString(), kp.publicKey.toString());
  });

  it("loads keypair from bracket-wrapped comma array", () => {
    const kp = Keypair.generate();
    const arr = Array.from(kp.secretKey);
    const loaded = loadKeypair("[" + arr.join(", ") + "]");
    assert.strictEqual(loaded.publicKey.toString(), kp.publicKey.toString());
  });

  it("trims whitespace around key string", () => {
    const kp = Keypair.generate();
    const encoded = bs58.encode(kp.secretKey);
    const loaded = loadKeypair("  " + encoded + "\n");
    assert.strictEqual(loaded.publicKey.toString(), kp.publicKey.toString());
  });
});

describe("getSweepDecision", () => {
  it("returns empty when balance is 0", () => {
    const out = getSweepDecision(0);
    assert.strictEqual(out.action, "empty");
    assert.strictEqual(out.sweepLamports, undefined);
  });

  it("returns skip_high when balance exceeds dust threshold", () => {
    const out = getSweepDecision(DUST_THRESHOLD + 1);
    assert.strictEqual(out.action, "skip_high");
    assert.strictEqual(out.sweepLamports, undefined);
  });

  it("returns sweep when balance equals dust threshold (inclusive dust)", () => {
    const out = getSweepDecision(DUST_THRESHOLD);
    assert.strictEqual(out.action, "sweep");
    assert.strictEqual(out.sweepLamports, DUST_THRESHOLD - FEE_BUFFER);
  });

  it("returns skip_low_gas when balance <= FEE_BUFFER", () => {
    assert.strictEqual(getSweepDecision(0).action, "empty");
    assert.strictEqual(getSweepDecision(1).action, "skip_low_gas");
    assert.strictEqual(getSweepDecision(FEE_BUFFER).action, "skip_low_gas");
  });

  it("returns sweep with correct lamports when balance in (FEE_BUFFER, DUST_THRESHOLD]", () => {
    const balance = FEE_BUFFER + 1000;
    const out = getSweepDecision(balance);
    assert.strictEqual(out.action, "sweep");
    assert.strictEqual(out.sweepLamports, 1000);
  });

  it("sweep amount leaves FEE_BUFFER for gas", () => {
    const balance = 50000;
    const out = getSweepDecision(balance);
    assert.strictEqual(out.action, "sweep");
    assert.strictEqual(out.sweepLamports, balance - FEE_BUFFER);
  });
});
