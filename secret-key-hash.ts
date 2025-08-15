import { createHash } from "node:crypto";

function hashSha256(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

console.log(hashSha256("<secret_key>"));