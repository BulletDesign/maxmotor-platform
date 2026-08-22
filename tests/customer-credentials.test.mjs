import assert from "node:assert/strict";
import test from "node:test";
import { generateTemporaryPassword } from "../functions/_lib/customer-identity.js";

test("staff credentials use the friendly Maxmotor ID", () => {
  assert.equal(generateTemporaryPassword("MM-13723"), "MXR-MM-13723");
});

test("customer password controls reveal existing values without weakening new passwords", async () => {
  const source = await import("node:fs/promises").then((fs) => fs.readFile(new URL("../assets/password-visibility.js", import.meta.url), "utf8"));
  assert.match(source, /autocomplete === "current-password"/);
  assert.match(source, /removeAttribute\("minlength"\)/);
  assert.match(source, /input\.type = reveal \? "text" : "password"/);
});
