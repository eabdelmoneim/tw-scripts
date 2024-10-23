import { createThirdwebClient, getContract, sendTransaction } from "thirdweb";
import { privateKeyToAccount } from "thirdweb/wallets";
import { defineChain } from "thirdweb/chains";
import { mintAdditionalSupplyTo } from "thirdweb/extensions/erc1155";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  // Initialize the thirdweb client
  const client = createThirdwebClient({
    secretKey: process.env.THIRDWEB_SECRET_KEY as string,
  });

  // Define the Xsolla testnet chain
  const xsollaTestnet = defineChain({
    id: 333271,
    name: "Xsolla Testnet",
    nativeCurrency: {
      name: "Xsolla Testnet ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpc: "https://zkrpc.xsollazk.com",
  });

  // Initialize an account from the private key
  const account = privateKeyToAccount({
    client,
    privateKey: process.env.EOA_PRIVATE_KEY!,
  });

  // Get the ERC1155 contract
  const contract = getContract({
    client,
    address: "0x5a9b900a75AA3394eAbd05A0c06501963F326bdA",
    chain: xsollaTestnet,
  });

  const totalIterations = 10;
  let totalTime = 0;

  for (let i = 0; i < totalIterations; i++) {
    // Prepare the mintAdditionalSupply transaction
    const transaction = mintAdditionalSupplyTo({
      contract,
      tokenId: 0n, // Replace with the correct tokenId
      supply: 1n,
      to: account.address,
    });

    // Send the transaction and log the transaction hash and time
    try {
      const startTime = Date.now();
      const result = await sendTransaction({
        transaction,
        account,
      });
      const endTime = Date.now();
      const timeTaken = (endTime - startTime) / 1000; // Convert to seconds
      totalTime += timeTaken;
      console.log(`Iteration ${i + 1}:`);
      console.log("Transaction hash:", result.transactionHash);
      console.log("Time taken:", timeTaken, "seconds");
      console.log("------------------------");
    } catch (error) {
      console.error(`Error sending transaction in iteration ${i + 1}:`, error);
    }
  }

  // Calculate and log the average time
  const averageTime = totalTime / totalIterations;
  console.log(`Average time per transaction: ${averageTime.toFixed(2)} seconds`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
