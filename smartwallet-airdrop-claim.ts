import { createThirdwebClient, getContract, prepareContractCall, sendAndConfirmTransaction, sendBatchTransaction, sendTransaction } from "thirdweb";
import { privateKeyToAccount, smartWallet, inAppWallet } from "thirdweb/wallets";
import { defineChain } from "thirdweb/chains";
import { transfer } from "thirdweb/extensions/erc20";
import { claimERC20, generateMerkleTreeInfoERC20, setMerkleRoot, saveSnapshot, tokenMerkleRoot, fetchProofsERC20 } from "thirdweb/extensions/airdrop";
import dotenv from "dotenv";
import { allowance, approve, balanceOf } from "thirdweb/extensions/erc20";

dotenv.config();

async function main() {
  // Initialize the thirdweb client
  const client = createThirdwebClient({
    secretKey: process.env.THIRDWEB_SECRET_KEY as string,
  });

  // Define the custom chain
  const customChain = defineChain(84532);

  const localWallet = inAppWallet();
 
  const account = await localWallet.connect({
    client,
    strategy: "guest",
  });

  
  // 2. Connect to a smart wallet on the custom chain with gasless=true
  const wallet = smartWallet({
    chain: customChain,
    gasless: true,
  });

  const smartAccount = await wallet.connect({
    client,
    personalAccount: account,
  });

  console.log("new smart account address: " + smartAccount.address);

  // 1. Initialize an account for an EOA wallet from the private key
  const adminAccount = privateKeyToAccount({
    client,
    privateKey: process.env.EOA_PRIVATE_KEY!,
  });

    // Check token balance of admin account
    const adminBalance = await balanceOf({
      contract: getContract({
        client,
        address: "0x1A8FF7B2c5e35489d6f1AA62985d96708287b10C",
        chain: customChain,
      }),
      address: adminAccount.address,
    });
  
    console.log("Admin token balance:", adminBalance);

    // Approve more tokens for the airdrop contract
  const approveTx = approve({
    contract: getContract({
      client,
      address: "0x1A8FF7B2c5e35489d6f1AA62985d96708287b10C",
      chain: customChain,
    }),
    spender: "0xD6341Fe05bd4c31850FCdaABd8Db5DF47da5974b", // airdrop contract
    amount: "10000000000000000000", // 10 tokens with 18 decimals
  });

  const { transactionHash: approveTxHash } = await sendAndConfirmTransaction({
    transaction: approveTx,
    account: adminAccount,
  });
  console.log("approve transaction hash:", approveTxHash);


    const allowanceAmount = await allowance({
      contract: getContract({
        client,
        address: "0x1A8FF7B2c5e35489d6f1AA62985d96708287b10C",
        chain: customChain,
      }),
      owner: adminAccount.address,
      spender: "0xD6341Fe05bd4c31850FCdaABd8Db5DF47da5974b",
    });
  
    console.log("Airdrop contract allowance:", allowanceAmount);
  

  // 3. Get the ERC721 NFT contract
  const airdropContract = getContract({
    client,
    address: "0xD6341Fe05bd4c31850FCdaABd8Db5DF47da5974b",
    chain: customChain,
  });

  // snapshot / allowlist of airdrop recipients and amounts
const snapshot = [
  { recipient: smartAccount.address, amount: "1"},
];

  const merkleTreeInfo = await generateMerkleTreeInfoERC20({
    contract: airdropContract,
    tokenAddress: "0x1A8FF7B2c5e35489d6f1AA62985d96708287b10C",
    snapshot,
  });

  const setMerkleRootTx = setMerkleRoot({
    contract: airdropContract,
    token: "0x1A8FF7B2c5e35489d6f1AA62985d96708287b10C",
    tokenMerkleRoot:merkleTreeInfo.merkleRoot as `0x${string}`,
    resetClaimStatus: true,
  });

  console.log("merkle root: " + merkleTreeInfo.merkleRoot as `0x${string}`);

  const { transactionHash } = await sendAndConfirmTransaction({
    transaction: setMerkleRootTx,
    account: adminAccount,
  });

  console.log("smart account added to allowlist:" + transactionHash);

   // Add this step - save the snapshot data
  const snapshotTx = saveSnapshot({
    contract: airdropContract,
    merkleRoot: merkleTreeInfo.merkleRoot as `0x${string}`,
    snapshotUri: merkleTreeInfo.snapshotUri,
  });

  const { transactionHash: snapshotTxHash } = await sendAndConfirmTransaction({
    transaction: snapshotTx,
    account: adminAccount,
  });
  console.log("snapshot transaction hash:", snapshotTxHash);

  const currentMerkleRoot = await tokenMerkleRoot({
    contract: airdropContract,
    tokenAddress: "0x1A8FF7B2c5e35489d6f1AA62985d96708287b10C",
  });

  console.log("current merkle root: " + currentMerkleRoot);
  try {
    const proof = await fetchProofsERC20({
      contract: airdropContract,
      recipient: smartAccount.address,
      merkleRoot: currentMerkleRoot,
      tokenDecimals: 18, // Adjust based on your token
    });

    console.log("Proof found:", proof);
    console.log("Address is in merkle tree!");
  } catch (error) {
    console.log("Proof not found or address not in merkle tree:", error.message);
  }

  console.log("MerkleTreeInfo contents:", JSON.stringify(merkleTreeInfo, null, 2));
  console.log("Smart account address:", smartAccount.address);
  console.log("Snapshot data:", JSON.stringify(snapshot, null, 2));
  console.log("Waiting for snapshot data to be available...");
  await new Promise(resolve => setTimeout(resolve, 30000)); // 30 second delay
  console.log("current merkle root: " + currentMerkleRoot);
  try {
    const proof = await fetchProofsERC20({
      contract: airdropContract,
      recipient: smartAccount.address,
      merkleRoot: currentMerkleRoot,
      tokenDecimals: 18, // Adjust based on your token
    });

    console.log("Proof found:", proof);
    console.log("Address is in merkle tree!");
  } catch (error) {
    console.log("Proof not found or address not in merkle tree:", error.message);
  }

  const claimTx = claimERC20({
    contract: airdropContract,
    tokenAddress: "0x1A8FF7B2c5e35489d6f1AA62985d96708287b10C",
    recipient: smartAccount.address,
  });

  const tokenContract = getContract({
    address: "0x1A8FF7B2c5e35489d6f1AA62985d96708287b10C",
    chain: customChain,
    client,
  });

  const transferTx = transfer({
    contract: tokenContract,
    to: "0x749CaA9A7bbF7D5aEb8Ea6E92335AFa2f74dE4EE",
    amount: "1", // 10 tokens with 18 decimals
  });

  const { transactionHash: claimTxHash } = await sendBatchTransaction({
    transactions: [claimTx, transferTx],
    account: smartAccount,
  });
  console.log("batch transaction hash:", claimTxHash);
  
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});