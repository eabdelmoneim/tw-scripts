import { createThirdwebClient, encode, getContract, prepareTransaction, sendTransaction } from "thirdweb";
import { ethers6Adapter } from "thirdweb/adapters/ethers6";
import { privateKeyToAccount } from "thirdweb/wallets";
import { defineChain } from "thirdweb/chains";
import { generateMintSignature, mintWithSignature } from "thirdweb/extensions/erc721";
import dotenv from "dotenv";
import { toFunctionSelector } from "thirdweb/utils";
import { multicall } from "thirdweb/extensions/common"; 

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

  // Define the chain using environment variable
  const chain = defineChain(parseInt(process.env.THIRDWEB_NETWORK!));

  // Get the contract
  const contract = getContract({
    client,
    address: "0xBaD1F46D3cE12923D64a2B58a47fF7a717bd9ABa",
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
      },
    },
    account,
    contractType: "LoyaltyCard"
  });

  const {payload: payload2, signature: signature2} = await generateMintSignature({
    contract,
    mintRequest: {
      to: recipientAddress,
      metadata: {
        name: "My NFT",
        description: "This is my NFT",
        image: "https://example.com/image.png",
      },
    },
    account,
    contractType: "LoyaltyCard"
  });

  console.log("Generated signature:", signature);

  // Mint with signature
  console.log("minting NFT with signature");
  const transaction = mintWithSignature({
    contract,
    payload,
    signature,
  });

  const transaction2 = mintWithSignature({
    contract,
    payload: payload2,
    signature: signature2,
  });

//  console.log("transaction:", transaction);
  //console.log("transaction.to:", transaction.to);
  // Access value directly since it's a property, not a function
  //console.log("transaction.value:", transaction.value);
  let data: string | undefined;
  if (typeof transaction.data === "function") {
    data = await transaction.data();
  } else {
    data = transaction.data;
  }

  let data2: string | undefined;
  if (typeof transaction2.data === "function") {
    data2 = await transaction2.data();
  } else {
    data2 = transaction2.data;
  }

  console.log("data: ", data);
  console.log("data2: ", data2);

  const mTx = multicall({
    contract,
    data: [data as `0x${string}`, data2 as `0x${string}`],
  });

  //console.log("mTx:", mTx);

  const result = await sendTransaction({
    account,
    transaction: mTx,
  });
  
  console.log("Transaction hash:", result.transactionHash);

  

  // const encodedTx = await encode(transaction);

  // console.log("Encoded transaction:", encodedTx);

  //////////////////////////////////////////////////////////////
  // CLIENT SIDE CODE STARTS HERE
  //////////////////////////////////////////////////////////////  

  // Initialize an account from the private key
  // PRIVATE KEY1 HAS NO ROLE ON CONTRACT and is the WALLET that will be sending the transaction
  // const account2 = privateKeyToAccount({
  //   client,
  //   privateKey: process.env.EOA_PRIVATE_KEY!,
  // });

  // convert a thirdweb account to ethers signer
// const ethersSigner = await ethers6Adapter.signer.toEthers({
//   client,
//   chain,
//   account,
// });

//   // Define the typed data structure
//   const domain = {
//     name: "MyDApp",
//     version: "1",
//     chainId: chain.id,
//     verifyingContract: "0x19B1d2c3DDc60CD7cacC054CA94a4BC0f6c79204",
//   };

//   const types = {
//     NFT: [
//       { name: "to", type: "address" },
//       { name: "data", type: "bytes" },
//     ],
//   };

//   const value = {
//     to: recipientAddress,
//     data: encodedTx,
//   };

//   // Sign the typed data
//   const signedTx = await ethersSigner.signTypedData(domain, types, value);

//   // Prepare the transaction
//   const rawTx = {
//     to: "0x19B1d2c3DDc60CD7cacC054CA94a4BC0f6c79204",
//     data: encodedTx,
//     chainId: chain.id,
//     // You may need to include other fields like gasLimit, gasPrice, nonce, etc.
//   };

//   // Send the transaction
//   const transactionResponse = await ethersSigner.sendTransaction(rawTx);

//   console.log("Transaction hash:", transactionResponse.hash);

  // // Wait for the transaction to be mined
  // const receipt = await transactionResponse.wait();
  // console.log("Transaction receipt: ", receipt);

  // old contract: 0x507fb266c2CaBf31c78636dF9D427a29C76805DC
  // new contract: 0x19B1d2c3DDc60CD7cacC054CA94a4BC0f6c79204
  // ablo: 0x2A809210034C7fb0787FcAeB5DD69Ba58420af75

  // const rawTx = prepareTransaction({
  //   to: "0x19B1d2c3DDc60CD7cacC054CA94a4BC0f6c79204",
  //   chain,
  //   client,
  //   data: encodedTx
  // });

  // const result = await sendTransaction({
  //   transaction: rawTx,
  //   account: account2,
  //   gasless: {
  //     provider: "engine",
  //     relayerUrl: "https://eiman-demo.engine-dev.thirdweb.com/relayer/77ab447f-e86f-428a-9519-194652806db7",
  //     relayerForwarderAddress: "0xd04f98c88ce1054c90022ee34d566b9237a1203c"
  //   }
  // });

  // console.log("Transaction hash:", result.transactionHash);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
