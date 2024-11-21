import { createThirdwebClient, getContract, sendTransaction } from "thirdweb";
import { privateKeyToAccount } from "thirdweb/wallets";
import { defineChain } from "thirdweb/chains";
import { generateMintSignature, mintWithSignature } from "thirdweb/extensions/erc721";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  // Initialize the thirdweb client
  const client = createThirdwebClient({
    secretKey: process.env.THIRDWEB_SECRET_KEY as string,
  });

  // Initialize an account from the private key
  const account = privateKeyToAccount({
    client,
    privateKey: process.env.EOA_PRIVATE_KEY!,
  });

  // Define the chain using environment variable
  const chain = defineChain(parseInt(process.env.THIRDWEB_NETWORK!));

  // Get the contract
  const contract = getContract({
    client,
    address: "0x507fb266c2CaBf31c78636dF9D427a29C76805DC",
    chain,
  });

  // Generate signature
  const recipientAddress = "0xeAa5a7D7fA42CBAff443FE1BDB764E608E039F97";
  const {payload, signature} = await generateMintSignature({
    contract,
    mintRequest: {
      to: recipientAddress,
      metadata: {
        name: "My NFT",
        description: "This is my NFT",
        image: "https://example.com/image.png",
      }
    },
    account,
  });

  console.log("Generated signature:", signature);

  // Mint with signature
  console.log("minting NFT with signature");
  const transaction = mintWithSignature({
    contract,
    payload,
    signature,
  });

  const result = await sendTransaction({
    transaction,
    account,
  });

  console.log("Transaction hash:", result.transactionHash);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
