import { prepareEvent, getContractEvents } from "thirdweb";
import { getAllValidListings, totalListings } from "thirdweb/extensions/marketplace";
import { createThirdwebClient, getContract } from "thirdweb";
import { defineChain } from 'thirdweb/chains';

// Replace with your contract address and RPC URL for Somnia Shannon testnet
const contractAddress = "0x39462b440694d82780F0D9A96Bb1defCC94Fe3f2";

async function main() {

const client = createThirdwebClient({
    secretKey: process.env.THIRDWEB_SECRET_KEY as string,
});
      
  // Connect to the contract
  const contract = getContract({
    client,
    address: contractAddress,
    chain: defineChain(50312),
  });

  const total = await totalListings({
    contract,
  });
  console.log(`Total listings:`, total);

  const startTime = Date.now();
  

const preparedEvent = prepareEvent({
  signature:
    "event NewListing(address indexed listingCreator, uint256 indexed listingId, address indexed assetContract, (uint256 listingId, uint256 tokenId, uint256 quantity, uint256 pricePerToken, uint128 startTimestamp, uint128 endTimestamp, address listingCreator, address assetContract, address currency, uint8 tokenType, uint8 status, bool reserved) listing)",
});
const events = await getContractEvents({
  contract,
  events: [preparedEvent],
});

  console.log(`Events:`, events.length);

  const endTime = Date.now();
  const totalTimeSeconds = (endTime - startTime) / 1000;
  console.log(`Total time to get all events: ${totalTimeSeconds} seconds`);
}

main().catch(console.error);