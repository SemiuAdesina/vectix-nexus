import { describe, it } from "node:test";
import assert from "node:assert";
import { mkdtempSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import {
  generateAgentConfig,
  generateWallet,
  writeDeploymentArtifacts,
  runFoundryDeploy,
  DEFAULT_OUTPUT_DIR,
} from "./foundry-deploy-agent.mjs";

describe("generateAgentConfig", () => {
  it("returns config with required name and bio", () => {
    const config = generateAgentConfig();
    assert.strictEqual(typeof config.name, "string");
    assert.ok(config.name.length >= 1);
    assert.ok(Array.isArray(config.bio) || typeof config.bio === "string");
  });

  it("uses custom name and bio when provided", () => {
    const config = generateAgentConfig({ name: "Custom", bio: "Custom bio." });
    assert.strictEqual(config.name, "Custom");
    assert.deepStrictEqual(config.bio, ["Custom bio."]);
  });

  it("includes id, plugins, and style", () => {
    const config = generateAgentConfig();
    assert.ok(/^[0-9a-f-]{36}$/i.test(config.id));
    assert.ok(Array.isArray(config.plugins) && config.plugins.length >= 1);
    assert.ok(config.style && Array.isArray(config.style.all));
  });

  it("accepts bio as array", () => {
    const config = generateAgentConfig({ bio: ["Line one", "Line two"] });
    assert.deepStrictEqual(config.bio, ["Line one", "Line two"]);
  });
});

describe("generateWallet", () => {
  it("returns publicKey, privateKey, and keypair", () => {
    const out = generateWallet();
    assert.strictEqual(typeof out.publicKey, "string");
    assert.strictEqual(typeof out.privateKey, "string");
    assert.ok(out.keypair && typeof out.keypair.publicKey.toBase58 === "function");
  });

  it("produces distinct keypairs each call", () => {
    const a = generateWallet();
    const b = generateWallet();
    assert.notStrictEqual(a.publicKey, b.publicKey);
  });
});

describe("writeDeploymentArtifacts", () => {
  it("writes config and env files to given directory", () => {
    const tmp = mkdtempSync(join(tmpdir(), "foundry-"));
    const config = generateAgentConfig({ name: "TestAgent" });
    const wallet = generateWallet();

    const result = writeDeploymentArtifacts(config, wallet, tmp);

    assert.ok(existsSync(result.configPath));
    assert.ok(existsSync(result.envPath));
    const configContent = JSON.parse(readFileSync(result.configPath, "utf8"));
    assert.strictEqual(configContent.name, "TestAgent");
    const envContent = readFileSync(result.envPath, "utf8");
    assert.ok(envContent.includes("SOLANA_PUBLIC_KEY="));
    assert.ok(envContent.includes(wallet.publicKey));
  });
});

describe("runFoundryDeploy", () => {
  it("creates output dir and returns paths and artifacts", () => {
    const tmp = mkdtempSync(join(tmpdir(), "foundry-run-"));
    const result = runFoundryDeploy({ outputDir: tmp });

    assert.ok(existsSync(result.configPath));
    assert.ok(existsSync(result.envPath));
    assert.strictEqual(result.wallet.publicKey, result.wallet.keypair.publicKey.toBase58());
    const config = JSON.parse(readFileSync(result.configPath, "utf8"));
    assert.strictEqual(config.name, "Vectix Agent");
  });

  it("uses DEFAULT_OUTPUT_DIR when no outputDir", () => {
    const result = runFoundryDeploy();
    assert.ok(result.configPath.includes(DEFAULT_OUTPUT_DIR));
    assert.ok(result.envPath.includes(DEFAULT_OUTPUT_DIR));
  });
});
