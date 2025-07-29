import { createThirdwebClient, getContract, sendTransaction, Engine } from "thirdweb";
import { privateKeyToAccount, smartWallet } from "thirdweb/wallets";
import { defineChain } from "thirdweb/chains";
import { generateMintSignature, mintWithSignature } from "thirdweb/extensions/erc721";
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
    address: process.env.SMART_SERVER_WALLET_ADDRESS_DEV! as string,
    vaultAccessToken: process.env.VAULT_ACCESS_TOKEN_DEV! as string,
    executionOptions: {
      type: "ERC4337",
      address: process.env.SMART_SERVER_WALLET_ADDRESS! as string,
    },
  });

  console.log("server wallet address signing:", swAccount.address);

  // Get the contract
  const contract = getContract({
    client,
    address: "0x16dF4A9c003b9106A612c20338C9649B170ad1A8",
    chain,
  });

  // Generate signature
  const recipientAddress = "0x09EC71a68D4Ff05F5b8F1BB53F27e6a11d819a04";
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
    account: swAccount,
  });

  console.log("Generated signature:", signature);
  console.log("payload: ", payload);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // CLIENT SIDE CODE STARTS HERE
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
  // Initialize an account from the private key
  const clientSideAccount = privateKeyToAccount({
    client,
    privateKey: process.env.EOA_PRIVATE_KEY!,
  });

  // connect smart wallet and give session key to EOA signer of the server wallet
  const wallet = smartWallet({
    chain: chain,
    gasless: true,
    sessionKey: {
      address: process.env.EOA_SIGNER_SERVER_WALLET_ADDRESS! as string,
      permissions: {
        approvedTargets: "*",
      }
    }
  });

  const smartAccount = await wallet.connect({
    client,
    personalAccount: clientSideAccount,   
  });
  console.log("smart account address with session key:", smartAccount.address);


  // prepare transaction to mint with signature
  console.log("minting NFT with signature");
  const transaction = mintWithSignature({
    contract,
    payload,
    signature,
  });

  // get server wallet with execution option set to erc4337 and pass in user smart account address so tx is sent from user smart account
  // but signed by the EOA signer of the server wallet that was given session key above
  const swAccount2 = Engine.serverWallet({
    client,
    chain,
    address: process.env.SMART_SERVER_WALLET_ADDRESS! as string,
    vaultAccessToken: process.env.VAULT_ACCESS_TOKEN! as string,
    executionOptions: {
      type: "ERC4337",
      entrypointAddress: ENTRYPOINT_ADDRESS_v0_6,
      factoryAddress: DEFAULT_ACCOUNT_FACTORY_V0_6,
      signerAddress: process.env.EOA_SIGNER_SERVER_WALLET_ADDRESS! as string,
      smartAccountAddress: smartAccount.address
    },
  });

  // send tx to server wallet to execute
  const result = await sendTransaction({
    account: swAccount2,
    transaction: transaction,
  });
  
  console.log("Transaction hash:", result.transactionHash);

}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
