import { createThirdwebClient, getContract, sendTransaction, Engine } from "thirdweb";
import { privateKeyToAccount, smartWallet } from "thirdweb/wallets";
import { defineChain } from "thirdweb/chains";
import { generateMintSignature, mintWithSignature, mintTo } from "thirdweb/extensions/erc721";
import dotenv from "dotenv";
import { ENTRYPOINT_ADDRESS_v0_6, DEFAULT_ACCOUNT_FACTORY_V0_6 } from "thirdweb/wallets/smart";
import { setThirdwebDomains } from "thirdweb/utils";

dotenv.config();

async function main() {

  setThirdwebDomains({
    bundler: "bundler.thirdweb-dev.com",
    engineCloud: "engine.thirdweb-dev.com",
    rpc: "rpc.thirdweb-dev.com",
    storage: "storage.thirdweb-dev.com",
  });

  // Initialize the thirdweb client
  const client = createThirdwebClient({
    secretKey: process.env.THIRDWEB_SECRET_KEY_DEV as string,
  });

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // SERVER SIDE CODE STARTS HERE
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  // Define the chain using environment variable
  const chain = defineChain(84532);

  // get server wallet with execution option set to eoa
  const swAccount = Engine.serverWallet({
    client,
    chain,
    address: process.env.EOA_SIGNER_SERVER_WALLET_ADDRESS_DEV! as string,
    vaultAccessToken: process.env.VAULT_ACCESS_TOKEN_DEV! as string,
    // executionOptions: {
    //   type: "eoa",
    //   address: process.env.EOA_SIGNER_SERVER_WALLET_ADDRESS_DEV! as string,
    // },
  });

  console.log("server wallet address signing:", swAccount.address);

  // Get the contract
  const contract = getContract({
    client,
    address: "0x16dF4A9c003b9106A612c20338C9649B170ad1A8",
    chain,
  });

  const tx = mintTo({
    contract,
    to: "0xc3f2b2a12eba0f5989cd75b2964e31d56603a2ce",
    nft: {
      metadata: {
        name: "My NFT",
        description: "This is my NFT",
        image: "https://example.com/image.png",
      },
    }
  });

  // send tx to server wallet to execute
  const result = await sendTransaction({
    account: swAccount,
    transaction: tx,
  });
  
  console.log("Transaction hash:", result.transactionHash);

}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
