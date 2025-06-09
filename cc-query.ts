import { createThirdwebClient, getContract, sendTransaction } from "thirdweb";
import {getActiveClaimCondition, claimTo} from "thirdweb/extensions/erc1155"
import { defineChain } from "thirdweb/chains";
import dotenv from "dotenv";
import { privateKeyToAccount } from "thirdweb/wallets";

dotenv.config();

async function main() {
  // Initialize the thirdweb client
  const client = createThirdwebClient({
    secretKey: process.env.THIRDWEB_SECRET_KEY as string,
  });
  const account = privateKeyToAccount({
    client,
    privateKey: process.env.EOA_PRIVATE_KEY!,
  });
  // Define the custom chain (ChainId 296)
  const customChain = defineChain(2741);

  // 1. Get the ERC721 contract
  const contract = getContract({
    client,
    address: "0x35ffe9d966E35Bd1B0e79F0d91e438701eA1C644",
    chain: customChain,
  });

  console.log(contract);

  // 2. Query to find the owned NFTs
  try {
  const activeClaimCondition = await getActiveClaimCondition({ contract, tokenId: 40n })
  console.log(activeClaimCondition);

  const tx = claimTo({
    contract,
    tokenId: 40n,
    quantity: 1n,
    to: "0x09b9257437C3f6BC5Fc3e413501daFab197c919E",
  });
  const sentTx = await sendTransaction({account, transaction: tx});
  console.log(sentTx); 

   } catch (error) {
    console.error("Error querying active claim condition:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});