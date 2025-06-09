import { createThirdwebClient, getContract, sendAndConfirmTransaction } from "thirdweb";
import { privateKeyToAccount, smartWallet } from "thirdweb/wallets";
import { defineChain } from "thirdweb/chains";
import { getActiveClaimCondition } from "thirdweb/extensions/erc721";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  // Initialize the thirdweb client
  const client = createThirdwebClient({
    secretKey: process.env.THIRDWEB_SECRET_KEY as string,
  });

  // Define the custom chain
  const customChain = defineChain(11155111);

  // 1. Initialize an account for an EOA wallet from the private key
  const eoaAccount = privateKeyToAccount({
    client,
    privateKey: process.env.EOA_PRIVATE_KEY!,
  });

  // 2. Connect to a smart wallet on the custom chain with gasless=true
  const wallet = smartWallet({
    chain: customChain,
    gasless: true,
  });

  const smartAccount = await wallet.connect({
    client,
    personalAccount: eoaAccount,
  });

  // 3. Get the ERC721 NFT contract
  const contract = getContract({
    client,
    address: "0xcdD8333677a6B6b22bB8e817AB59883fcEbaAF74",
    chain: customChain,
  });

  const cc = await getActiveClaimCondition({
    contract
  });

  console.log(cc);

  const totalIterations = 1;
  let totalTime = 0;

  for (let i = 0; i < totalIterations; i++) {
    // 4. Prepare the claimTo transaction
    // const transaction = claimTo({
    //   contract,
    //   to: eoaAccount.address,
    //   quantity: 1n,
    // });

    // // 5. Send the transaction and log the transaction hash and time
    // try {
    //   const startTime = Date.now();
    //   const result = await sendAndConfirmTransaction({
    //     transaction,
    //     account: smartAccount,
    //   });
    //   const endTime = Date.now();
    //   const timeTaken = (endTime - startTime) / 1000; // Convert to seconds
    //   totalTime += timeTaken;
    //   console.log(`Iteration ${i + 1}:`);
    //   console.log("Transaction hash:", result.transactionHash);
    //   console.log("Time taken:", timeTaken, "seconds");
    //   console.log("------------------------");
    // } catch (error) {
    //   console.error(`Error sending transaction in iteration ${i + 1}:`, error);
    // }
  }

  // Calculate and log the average time
  const averageTime = totalTime / totalIterations;
  console.log(`Average time per transaction: ${averageTime.toFixed(2)} seconds`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});