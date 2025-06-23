import { createThirdwebClient, getContract, sendTransaction, Engine } from "thirdweb";
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


  // Define the chain using environment variable
  const chain = defineChain(84532);

  // get server wallet using the signer address instead of smart wallet address
  const account2 = Engine.serverWallet({
    client,
    chain,
    address: "0x3A75736b1C9A5A8679D90F7edd0B3630c8587FA9",
    vaultAccessToken: process.env.VAULT_ACCESS_TOKEN! as string,
  });

  console.log("server wallet address signing:", account2.address);

  // Get the contract
  const contract = getContract({
    client,
    address: "0x16dF4A9c003b9106A612c20338C9649B170ad1A8",
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
        //image: "https://example.com/image.png",
      },
    },
    account: account2,
  });

  console.log("Generated signature:", signature);
  console.log("payload: ", payload);

  //////////////////////////////////////////////////////////////
  // CLIENT SIDE CODE STARTS HERE
  //////////////////////////////////////////////////////////////
  
  // Initialize an account from the private key
  // PRIVATE KEY2 HAS MINTER ROLE ON CONTRACT
  const account = privateKeyToAccount({
    client,
    privateKey: process.env.EOA_PRIVATE_KEY!,
  });

  // Mint with signature
  console.log("minting NFT with signature");
  const transaction = mintWithSignature({
    contract,
    payload,
    signature,
  });

  const result = await sendTransaction({
    account,
    transaction: transaction,
  });
  
  console.log("Transaction hash:", result.transactionHash);

}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
