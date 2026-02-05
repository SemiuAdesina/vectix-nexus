import readline from "readline";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname);
const SDK_DIR = path.join(ROOT, "scripts", "axiom-protocol", "sdk");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.clear();
console.log(
  "\x1b[36m%s\x1b[0m",
  `
██╗   ██╗███████╗██╗██╗  ██╗
██║   ██║██╔════╝██║╚██╗██╔╝
██║   ██║█████╗  ██║ ╚███╔╝ 
╚██╗ ██╔╝██╔══╝  ██║ ██╔██╗ 
 ╚████╔╝ ███████╗██║██╔╝ ██╗
  ╚═══╝  ╚══════╝╚═╝╚═╝  ╚═╝
   VECTIX FOUNDRY v0.1.0   
   Autonomous Agent OS     
`
);

const FOUNDRY_SCRIPT = path.join(ROOT, "scripts", "foundry-deploy-agent.mjs");
const PAY_LICENSE_SCRIPT = path.join(ROOT, "scripts", "pay-license.mjs");

function showMenu() {
  console.log("\n\x1b[33m%s\x1b[0m", "AVAILABLE MODULES:");
  console.log("[1] Identity & Reasoning (SOLPRISM Integration)");
  console.log("[2] Asset Management (Gravedigger / Dust Sweeper)");
  console.log("[3] Foundry — Deploy a New Agent");
  console.log("[4] Pay Protocol License (Monetization Demo)");
  console.log("[5] Exit");

  rl.question("\nSelect module to execute [1-5]: ", (choice) => {
    if (choice === "1") {
      console.log("\n\x1b[32m%s\x1b[0m", ">> Initializing Identity Proof Protocol...");
      try {
        execSync("node prove-vectix.mjs", { stdio: "inherit", cwd: SDK_DIR });
      } catch (e) {
        console.error("Error running script.");
      }
      showMenu();
    } else if (choice === "2") {
      console.log("\n\x1b[32m%s\x1b[0m", ">> Scanning Wallet for Dust...");
      try {
        execSync("node ../../dust-sweeper.mjs", { stdio: "inherit", cwd: SDK_DIR });
      } catch (e) {
        console.error("Error running script.");
      }
      showMenu();
    } else if (choice === "3") {
      console.log("\n\x1b[32m%s\x1b[0m", ">> Foundry: Deploy a New Agent (config + wallet)...");
      try {
        execSync(`node "${FOUNDRY_SCRIPT}"`, { stdio: "inherit", cwd: ROOT });
      } catch (e) {
        console.error("Error running Foundry.");
      }
      showMenu();
    } else if (choice === "4") {
      console.log("\n\x1b[35m%s\x1b[0m", ">> Processing Protocol Subscription...");
      try {
        execSync(`node "${PAY_LICENSE_SCRIPT}"`, { stdio: "inherit", cwd: ROOT });
      } catch (e) {
        console.error("Error running script.");
      }
      showMenu();
    } else if (choice === "5") {
      console.log("Shutting down Vectix Core.");
      rl.close();
    } else {
      console.log("Invalid selection.");
      showMenu();
    }
  });
}

showMenu();
