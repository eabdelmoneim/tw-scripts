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
      owner: "0xbEDCf49C6fF86dC5B0523d78F08be8e80D7B2089", // Replace with the address you want to query
    });

    console.log("Owned NFTs:");
    console.log(JSON.stringify(ownedNFTs, null, 2));
  } catch (error) {
    console.error("Error querying owned NFTs:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});