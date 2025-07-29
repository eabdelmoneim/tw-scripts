import { createThirdwebClient, getContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { tokenMerkleRoot, fetchProofsERC20 } from "thirdweb/extensions/airdrop";
import dotenv from "dotenv";

dotenv.config();

async function checkAddressInMerkleRoot(
  addressToCheck: string,
  tokenAddress: string,
  tokenDecimals: number = 18
) {
  // Initialize the thirdweb client
  const client = createThirdwebClient({
    secretKey: process.env.THIRDWEB_SECRET_KEY as string,
  });

  // Define the chain (2020)
  const chain = defineChain(2020);

  // Get the airdrop contract
  const airdropContract = getContract({
    client,
    address: "0xeB25503d0fd04d0adB3bc739ae117d86f6629051",
    chain,
  });

  try {
    // Get the current merkle root for the token
    const currentMerkleRoot = await tokenMerkleRoot({
      contract: airdropContract,
      tokenAddress,
    });

    console.log("Current merkle root:", currentMerkleRoot);

    if (!currentMerkleRoot || currentMerkleRoot === "0x0000000000000000000000000000000000000000000000000000000000000000") {
      console.log("No merkle root set for this token address");
      return false;
    }

    // Try to fetch proofs for the address
    try {
      const proof = await fetchProofsERC20({
        contract: airdropContract,
        recipient: addressToCheck,
        merkleRoot: currentMerkleRoot,
        tokenDecimals,
      });

      console.log("✅ Address is in the merkle tree!");
      console.log("Proof details:", proof);
      return true;
    } catch (proofError) {
      console.log("❌ Address is NOT in the merkle tree");
      console.log("Error:", proofError.message);
      return false;
    }
  } catch (error) {
    console.error("Error checking merkle root:", error);
    return false;
  }
}

async function main() {
  // Get command line arguments
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error("❌ Error: Please provide an address to check");
    console.log("Usage: npx tsx check-merkle-address.ts <address> [tokenAddress] [tokenDecimals]");
    console.log("Example: npx tsx check-merkle-address.ts 0x749CaA9A7bbF7D5aEb8Ea6E92335AFa2f74dE4EE");
    process.exit(1);
  }

  const addressToCheck = args[0];
  const tokenAddress = args[1] || "0x7dc167e270d5EF683ceaf4aFCDf2efbDd667a9A7"; // Default token address
  const tokenDecimals = args[2] ? parseInt(args[2]) : 18; // Default to 18 decimals

  // Basic validation for Ethereum address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(addressToCheck)) {
    console.error("❌ Error: Invalid address format. Please provide a valid Ethereum address.");
    process.exit(1);
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
    console.error("❌ Error: Invalid token address format. Please provide a valid Ethereum address.");
    process.exit(1);
  }

  console.log(`Checking if address ${addressToCheck} is in merkle root...`);
  console.log(`Token address: ${tokenAddress}`);
  console.log(`Token decimals: ${tokenDecimals}`);
  console.log(`Chain: 2020`);
  console.log(`Airdrop contract: 0xeB25503d0fd04d0adB3bc739ae117d86f6629051`);
  console.log("---");

  const isInMerkleTree = await checkAddressInMerkleRoot(
    addressToCheck,
    tokenAddress,
    tokenDecimals
  );

  console.log(`\nResult: Address ${isInMerkleTree ? "IS" : "IS NOT"} in the merkle tree`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}); 