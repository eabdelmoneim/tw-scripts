import { createThirdwebClient } from "thirdweb";
import { upload } from "thirdweb/storage";
 
async function main() {
// Initialize the thirdweb client
const client = createThirdwebClient({
    secretKey: process.env.THIRDWEB_SECRET_KEY as string,
  });
  
const uris = await upload({
  client,
  files: [
    {
        "background_color": "",
        "description": "",
        "external_url": "",
        "image": "ipfs://QmUNdCrTPEf4hMEQXhQsgz3JsjCaMw8K4whq5icVkkKQ9F",
        "name": "testing update"
      },
  ],
});

console.log(uris);
}

main();