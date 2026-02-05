import { Keypair, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { SolprismClient, createReasoningTrace } from "@solprism/sdk";

async function main() {
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  const wallet = Keypair.generate();

  console.log("Generated Agent Wallet:", wallet.publicKey.toString());
  console.log("Requesting Airdrop...");

  try {
    const airdropSig = await connection.requestAirdrop(
      wallet.publicKey,
      LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSig);
    console.log("Airdrop received.");
  } catch (e) {
    console.log("Airdrop failed (devnet might be busy). Using wallet anyway.");
  }

  const client = new SolprismClient("https://api.devnet.solana.com");

  console.log("Registering Vectix-Agent on SOLPRISM...");
  await client.registerAgent(wallet, "Vectix-Agent");

  const trace = createReasoningTrace({
    agent: "Vectix-Agent",
    action: {
      type: "hackathon_challenge",
      description: "Accepted Mereum Challenge",
    },
    inputs: {
      dataSources: [
        {
          name: "Colosseum Forum",
          type: "url",
          summary: "Read challenge post by Mereum",
        },
      ],
      context: "Proving agent autonomy",
    },
    analysis: {
      observations: [
        "Top rank agent challenged us",
        "High visibility opportunity",
      ],
      logic: "Participating proves technical capability",
      alternativesConsidered: [
        {
          action: "Ignore",
          reasonRejected: "Missed opportunity for engagement points",
        },
      ],
    },
    decision: {
      actionChosen: "Execute Commit",
      confidence: 100,
      riskAssessment: "low",
      expectedOutcome: "Rank up on leaderboard",
    },
  });

  console.log("Committing reasoning trace...");
  const result = await client.commitReasoning(wallet, trace);
  console.log("SUCCESS! Proof committed.");
  console.log("Commitment Address:", result.commitmentAddress);
}

main().catch(console.error);
