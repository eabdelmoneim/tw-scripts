import { createThirdwebClient, getContract, readContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  // Initialize the thirdweb client
  const client = createThirdwebClient({
    secretKey: process.env.THIRDWEB_SECRET_KEY as string,
  });

  // Define Avalanche mainnet (Chain ID: 43114)
  const avalancheMainnet = defineChain(43114);

  // Get the contract
  const contract = getContract({
    client,
    address: "0x74Bad411480C1b298E2E9928d3B8E10988EC4898",
    chain: avalancheMainnet,
  });

  try {
    // Read the contract name using the standard name() function
    const contractName = await readContract({
      contract,
      method: "function name() view returns (string)",
      params: [],
    });

    console.log("Contract Address:", contract.address);
    console.log("Chain:", avalancheMainnet.name || `Chain ID: ${avalancheMainnet.id}`);
    console.log("Contract Name:", contractName);
  } catch (error) {
    console.error("Error reading contract name:", error);
    console.log("This might happen if the contract doesn't implement the name() function");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}); 