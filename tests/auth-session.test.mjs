import assert from "node:assert/strict";
import test from "node:test";
import { createSession } from "../functions/_lib/auth.js";

const db = { prepare() { return { bind() { return { async run() { return { success: true }; } }; } }; } };

test("uses isolated cookies and a 24 hour limit for privileged roles", async () => {
  const customer = await createSession(db, "customer-id", "https://example.com", "customer");
  const employee = await createSession(db, "employee-id", "https://example.com", "employee");
  const superadmin = await createSession(db, "super-id", "https://example.com", "superadmin");
  assert.match(customer.cookie, /^mxr_customer_session=/);
  assert.match(customer.cookie, /Max-Age=1209600/);
  assert.match(employee.cookie, /^mxr_employee_session=/);
  assert.match(employee.cookie, /Max-Age=86400/);
  assert.match(superadmin.cookie, /^mxr_superadmin_session=/);
  assert.match(superadmin.cookie, /Max-Age=86400/);
});
