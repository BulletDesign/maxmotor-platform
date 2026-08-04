import assert from "node:assert/strict";
import test from "node:test";
import { hashPassword, verifyPassword } from "../functions/_lib/crypto.js";

test("hashes and verifies a password with the Cloudflare-compatible PBKDF2 cost", async () => {
  const password = "Temporary-password-2026";
  const secured = await hashPassword(password);
  assert.equal(await verifyPassword(password, secured.hash, secured.salt), true);
  assert.equal(await verifyPassword("incorrect-password", secured.hash, secured.salt), false);
});
