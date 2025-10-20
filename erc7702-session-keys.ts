import {
  createThirdwebClient,
  getContract,
  sendBatchTransaction,
} from "thirdweb";
import { base } from "thirdweb/chains";
import {
  inAppWallet,
  createSessionKey,
} from "thirdweb/wallets/in-app";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  // Initialize the thirdweb client
  const client = createThirdwebClient({
    secretKey: process.env.THIRDWEB_SECRET_KEY as string,
  });

  // Generate 10 different session key addresses for testing
  const sessionKeyAddresses = [
    "0x1111111111111111111111111111111111111111",
    "0x2222222222222222222222222222222222222222",
    "0x3333333333333333333333333333333333333333",
    "0x4444444444444444444444444444444444444444",
    "0x5555555555555555555555555555555555555555",
    "0x6666666666666666666666666666666666666666",
    "0x7777777777777777777777777777777777777777",
    "0x8888888888888888888888888888888888888888",
    "0x9999999999999999999999999999999999999999",
    "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  ];

  console.log("Setting up ERC-7702 wallet...");

  // Create in-app wallet with EIP-7702 execution mode
  const wallet = inAppWallet({
    executionMode: {
      mode: "EIP7702",
      sponsorGas: true, // Enable gas sponsorship
    },
  });

  // Connect the wallet (using guest strategy for testing)
  const account = await wallet.connect({
    chain: base,
    client: client,
    strategy: "guest",
  });

  console.log("Upgraded EOA address:", account.address);

  // Get account contract
  const accountContract = getContract({
    address: account.address,
    chain: base,
    client: client,
  });

  console.log("Creating batch transaction with 10 session keys...");

  // Create session key transactions for all 10 addresses
  const sessionKeyTransactions = sessionKeyAddresses.map((address) => 
    createSessionKey({
      account: account,
      contract: accountContract,
      sessionKeyAddress: address,
      durationInSeconds: 86400, // 1 day
      grantFullPermissions: true,
    })
  );

  try {
    // Attempt to send all 10 session key transactions as a batch
    console.log("Sending batch transaction with 10 session keys...");
    
    const startTime = performance.now();
    const batchResult = await sendBatchTransaction({
      account: account,
      transactions: sessionKeyTransactions,
    });
    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log("✅ Batch transaction successful!");
    console.log(`⏱️  Time taken: ${duration} seconds`);
    console.log("Transaction hash:", batchResult.transactionHash);
    console.log(`All ${sessionKeyAddresses.length} session keys added successfully!`);

  } catch (error) {
    console.error("❌ Error sending batch transaction:");
    console.error(error);
    throw error;
  }
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exit(1);
});

