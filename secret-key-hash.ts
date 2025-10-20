import { createHash } from "node:crypto";

function hashSha256(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

console.log(hashSha256("_wpLxRroCN7mrzX_zyMHmEWBfstsK6LyGqPLccnjIyJGYCQ2p1qkzkX5b78X_ER_jboRyHRYHfMtG7IUzmTeBQ"));