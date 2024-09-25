import { createThirdwebClient, getContract } from "thirdweb";
import { getOwnedNFTs } from "thirdweb/extensions/erc721";
import { defineChain } from "thirdweb/chains";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  // Initialize the thirdweb client
  const client = createThirdwebClient({
    secretKey: process.env.THIRDWEB_SECRET_KEY as string,
  });

  // Define the custom chain (ChainId 296)
  const customChain = defineChain(296);

  // 1. Get the ERC721 contract
  const contract = getContract({
    client,
    address: "0xF1bC9fdb35231f6BB0dDdE42701c2cE088d893dF",
    chain: customChain,
  });

  // 2. Query to find the owned NFTs
  try {
    const ownedNFTs = await getOwnedNFTs({
      contract,
      owner: "0x09b9257437C3f6BC5Fc3e413501daFab197c919E", // Replace with the address you want to query
    });

    console.log("Owned NFTs:");
    console.log(ownedNFTs);
  } catch (error) {
    console.error("Error querying owned NFTs:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});