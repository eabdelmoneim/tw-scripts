import { createThirdwebClient, getContract, sendTransaction } from "thirdweb";
import { privateKeyToAccount } from "thirdweb/wallets";
import { sepolia } from "thirdweb/chains";
import { generateMintSignature, mintWithSignature } from "thirdweb/extensions/erc1155";
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
    privateKey: process.env.EOA_PRIVATE_KEY!,
  });

 //console.log("private key:", process.env.EOA_PRIVATE_KEY);

  // Get the contract
  const contract = getContract({
    client,
    address: "0x3f792dfc286612683573B4Cb557fF27A5B020784",
    chain: sepolia,
  });

  // Generate signature
  const recipientAddress = "0xeAa5a7D7fA42CBAff443FE1BDB764E608E039F97";
  const {payload, signature} = await generateMintSignature({
    contract,
    mintRequest: {
      to: recipientAddress,
      quantity: 1n,
      //tokenId: 0n,
      metadata: {
        name: "My ERC1155 #2",
        description: "This is my ERC1155 #2",
        //image: "https://example.com/image.png",
      },
    },
    account
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
    account,
    transaction: transaction,
  });
  
  console.log("Transaction hash:", result.transactionHash);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
