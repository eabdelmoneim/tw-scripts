import { createThirdwebClient, getContract } from "thirdweb";
import { isERC20 } from "thirdweb/extensions/erc20";
import { defineChain } from "thirdweb/chains";
import { resolveContractAbi } from "thirdweb/contract";
import { toFunctionSelector } from "thirdweb/utils";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  // Initialize the thirdweb client
  const client = createThirdwebClient({
    secretKey: process.env.THIRDWEB_SECRET_KEY as string,
  });

  // Define the chain using environment variable
  const chain = defineChain(8453);

  // Get the contract
  const contract = getContract({
    client,
    address: "0x6B2504A03ca4D43d0D73776F6aD46dAb2F2a4cFD", // Replace with the contract address you want to check
    chain,
  });

  try {
    // Get contract ABI and function selectors
    const abi = await resolveContractAbi(contract);
    const selectors = abi
      .filter((f: { type: string }) => f.type === "function")
      .map((f) => toFunctionSelector(f));

    console.log(selectors);

    // Check if contract is ERC20
    const isErc20Contract = isERC20(selectors);
    
    console.log(`Contract address: ${contract.address}`);
    console.log(`Is ERC20: ${isErc20Contract}`);
    
  } catch (error) {
    console.error("Error checking contract:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}); 