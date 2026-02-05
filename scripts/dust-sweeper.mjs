import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  PublicKey,
} from "@solana/web3.js";
import bs58 from "bs58";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv(envPath) {
  if (!existsSync(envPath)) return;
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.startsWith("#") || !trimmed) continue;
    const m = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
}

loadEnv(join(__dirname, "axiom-protocol/sdk/../../../eliza/.env"));
loadEnv(join(__dirname, "../eliza/.env"));
loadEnv(join(process.cwd(), ".env"));

const TRENCH_ADDRESS = "TrEnChRxG6sQ5Z5aC7yB9qN8wE2sF4jH1kL9pQ3r";
const DUST_THRESHOLD = 10.0 * LAMPORTS_PER_SOL;
const FEE_BUFFER = 5000;

export function loadKeypair(raw) {
  const trimmed = raw.trim();
  if (trimmed.startsWith("[") || /^[\d,\s]+$/.test(trimmed)) {
    const arr = trimmed.replace(/^\[|\]$/g, "").split(",").map((n) => parseInt(n.trim(), 10));
    return Keypair.fromSecretKey(new Uint8Array(arr));
  }
  const decoded = bs58.decode(trimmed);
  if (decoded.length === 64) return Keypair.fromSecretKey(decoded);
  if (decoded.length === 65) return Keypair.fromSecretKey(decoded.subarray(0, 64));
  return Keypair.fromSeed(decoded.subarray(0, 32));
}

export function getSweepDecision(balanceLamports) {
  if (balanceLamports === 0) return { action: "empty" };
  if (balanceLamports > DUST_THRESHOLD) return { action: "skip_high" };
  if (balanceLamports <= FEE_BUFFER) return { action: "skip_low_gas" };
  return { action: "sweep", sweepLamports: balanceLamports - FEE_BUFFER };
}

export { TRENCH_ADDRESS, DUST_THRESHOLD, FEE_BUFFER };

async function main() {
  console.log("Vectix Dust Sweeper initializing...");

  const connection = new Connection("https://api.devnet.solana.com", "confirmed");

  const privateKeyString = process.env.SOLANA_PRIVATE_KEY;
  if (!privateKeyString) {
    console.error("SOLANA_PRIVATE_KEY not found in .env");
    process.exit(1);
  }

  const wallet = loadKeypair(privateKeyString);
  console.log("Agent Wallet:", wallet.publicKey.toString());

  const balance = await connection.getBalance(wallet.publicKey);
  console.log("Current Balance:", balance / LAMPORTS_PER_SOL, "SOL");

  if (balance === 0) {
    console.log("Wallet is empty. Nothing to sweep.");
    return;
  }

  if (balance > DUST_THRESHOLD) {
    console.log("Balance exceeds dust threshold (> 0.1 SOL). Keeping funds.");
    return;
  }

  if (balance <= FEE_BUFFER) {
    console.log("Balance too low to cover gas fees.");
    return;
  }

  const sweepAmount = balance - FEE_BUFFER;
  console.log("Sweeping", (sweepAmount / LAMPORTS_PER_SOL).toFixed(6), "SOL to The Trench...");

  try {
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: new PublicKey(TRENCH_ADDRESS),
        lamports: sweepAmount,
      })
    );

    const signature = await sendAndConfirmTransaction(connection, transaction, [wallet]);
    console.log("SUCCESS Dust swept.");
    console.log("Transaction: https://explorer.solana.com/tx/" + signature + "?cluster=devnet");
  } catch (error) {
    console.error("Failed to sweep dust:", error.message);
  }
}

const isEntry = typeof process !== "undefined" && process.argv[1] && process.argv[1].includes("dust-sweeper.mjs");
if (isEntry) main().catch(console.error);
