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
  for (let start = BigInt(70); start < total; start += BigInt(9)) {
    const remaining = total - start;
    const count = remaining >= 9 ? 9 : remaining;
    const listings = await getAllValidListings({
      contract,
      start: Number(start),
      count: BigInt(count),
    });
    console.log(`Listings ${start} to ${start + BigInt(count)}:`, listings.length);
  }
  const endTime = Date.now();
  const totalTimeSeconds = (endTime - startTime) / 1000;
  console.log(`Total time to get all listings: ${totalTimeSeconds} seconds`);
}

main().catch(console.error);