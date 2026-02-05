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

loadEnv(join(__dirname, "../eliza/.env"));
loadEnv(join(process.cwd(), ".env"));

const TREASURY_ADDRESS = "VecTixTreasuryMoNi3X4a9B7c8D2e1F5g6H0iJkL";
const REAL_TREASURY = "TrEnChRxG6sQ5Z5aC7yB9qN8wE2sF4jH1kL9pQ3r";
const LICENSE_FEE_LAMPORTS = 0.05 * LAMPORTS_PER_SOL;
const RENT_BUFFER = 5000;

function canAffordLicense(balanceLamports) {
  return balanceLamports >= LICENSE_FEE_LAMPORTS + RENT_BUFFER;
}

function loadWalletFromEnv() {
  const privateKeyString = process.env.SOLANA_PRIVATE_KEY;
  if (!privateKeyString) throw new Error("SOLANA_PRIVATE_KEY not found in .env");
  let secretKey;
  if (privateKeyString.includes("[")) {
    secretKey = Uint8Array.from(JSON.parse(privateKeyString));
  } else {
    secretKey = bs58.decode(privateKeyString);
  }
  return Keypair.fromSecretKey(secretKey);
}

async function main() {
  console.log("Initiating Vectix Protocol License Payment...");

  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  const wallet = loadWalletFromEnv();

  const balance = await connection.getBalance(wallet.publicKey);
  if (!canAffordLicense(balance)) {
    console.error(
      "Insufficient funds. Balance:",
      (balance / LAMPORTS_PER_SOL).toFixed(4),
      "SOL. Needed: 0.05 SOL + fee buffer."
    );
    return;
  }

  try {
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: new PublicKey(REAL_TREASURY),
        lamports: LICENSE_FEE_LAMPORTS,
      })
    );

    console.log("Paying 0.05 SOL license fee to treasury...");
    const signature = await sendAndConfirmTransaction(connection, transaction, [wallet]);
    console.log("License acquired.");
    console.log("Receipt: https://explorer.solana.com/tx/" + signature + "?cluster=devnet");
  } catch (error) {
    console.error("Payment failed:", error.message);
  }
}

export { TREASURY_ADDRESS, REAL_TREASURY, LICENSE_FEE_LAMPORTS, RENT_BUFFER, canAffordLicense, loadWalletFromEnv };

const isEntry =
  typeof process !== "undefined" &&
  process.argv[1] &&
  process.argv[1].includes("pay-license.mjs");
if (isEntry) main().catch(console.error);
