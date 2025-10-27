import { createThirdwebClient } from "thirdweb";
import { upload } from "thirdweb/storage";
import { readFileSync } from "fs";
import { join } from "path";
 
async function main() {
  // Initialize the thirdweb client
  const client = createThirdwebClient({
    secretKey: process.env.THIRDWEB_SECRET_KEY as string,
  });
  
  // Read the PNG file from disk
  const imagePath = join(process.cwd(), "Arc_Icon_FC.png");
  const imageBuffer = readFileSync(imagePath);
  
  // Create a File object from the buffer - convert Buffer to Uint8Array for compatibility
  const uint8Array = new Uint8Array(imageBuffer);
  const imageFile = new File([uint8Array], "Arc_Icon_FC.png", { type: "image/png" });
  
  // Upload to IPFS
  const uris = await upload({
    client,
    files: [imageFile],
  });

  console.log("Uploaded to IPFS:");
  console.log(uris);
}

main();