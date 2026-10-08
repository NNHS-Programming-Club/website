import test from "node:test";
import assert from "node:assert/strict";
import { buildApp } from "../src/api/app.ts";

test("GET /healthz returns ok", async (t) => {
  const app = buildApp();
  t.after(() => app.close());

  const res = await app.inject({ method: "GET", url: "/healthz" });

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.json(), { status: "ok" });
});
