import { createThirdwebClient, encode, getContract, prepareTransaction, sendTransaction } from "thirdweb";
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

  //////////////////////////////////////////////////////////////
  // SERVER SIDE CODE STARTS HERE
  //////////////////////////////////////////////////////////////

  // Initialize an account from the private key
  // PRIVATE KEY2 HAS MINTER ROLE ON CONTRACT
  const account = privateKeyToAccount({
    client,
    privateKey: process.env.EOA_PRIVATE_KEY2!,
  });

  // Define the chain using environment variable
  const chain = defineChain(parseInt(process.env.THIRDWEB_NETWORK!));

  // Get the contract
  const contract = getContract({
    client,
    address: "0xdD98DdE731e7Ff82101Edb767822BaAfC5a9C015",
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

  const encodedTx = await encode(transaction);

  //////////////////////////////////////////////////////////////
  // CLIENT SIDE CODE STARTS HERE
  //////////////////////////////////////////////////////////////  

  // Initialize an account from the private key
  // PRIVATE KEY1 HAS NO ROLE ON CONTRACT and is the WALLET that will be sending the transaction
  const account2 = privateKeyToAccount({
    client,
    privateKey: process.env.EOA_PRIVATE_KEY!,
  });


  const rawTx = prepareTransaction({
    to: "0xdD98DdE731e7Ff82101Edb767822BaAfC5a9C015",
    chain,
    client,
    data: encodedTx
  });

  const result = await sendTransaction({
    transaction: rawTx,
    account: account2,
  });

  console.log("Transaction hash:", result.transactionHash);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
