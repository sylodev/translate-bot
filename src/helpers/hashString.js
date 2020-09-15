import crypto from "crypto";

export function hashString(input) {
  const md5sum = crypto.createHash("md5").update(input);
  const digest = md5sum.digest("hex");
  return digest;
}
